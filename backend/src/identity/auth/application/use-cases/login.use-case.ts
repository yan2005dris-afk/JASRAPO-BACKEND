import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../../../sessions/application/sessions.service';
import { LoginUserDto } from '../../interfaces/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import {
  REFRESH_TOKEN_MAX_AGE_MS,
  LOGIN_LOCKOUT_THRESHOLD,
  LOGIN_LOCKOUT_WINDOW_MS,
  LOGIN_LOCKOUT_DURATION_MS,
} from 'src/infrastructure/config/app.constants';
import { EcuadorTimezoneUtil } from 'src/shared/utils/ecuador-timezone.util';
import type { DecodedJwt } from '../types/auth-service.types';
import type { StringValue } from 'ms';

import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

interface ValidatedUser {
  usuarioId: number;
  email: string;
  clave: string;
  deletedAt?: Date | null;
  nombres: string | null;
  apellidos: string | null;
  avatar: unknown;
  rol: { rolId: number; nombre: string; deletedAt?: Date | null } | null;
}

const LOCKOUT_OPTIONS = {
  threshold: LOGIN_LOCKOUT_THRESHOLD,
  windowMs: LOGIN_LOCKOUT_WINDOW_MS,
  lockoutDurationMs: LOGIN_LOCKOUT_DURATION_MS,
} as const;

@LogContext()
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    loginUserDto: LoginUserDto,
    ip: string = 'unknown',
    userAgent: string = 'unknown',
  ) {
    const user = await this.validateUser(loginUserDto);
    this.logger.log(`[LOGIN] user=${user.usuarioId} | ip="${ip}"`);

    // Login exitoso: limpia contadores de intentos fallidos y lockouts previos.
    try {
      await this.userRepository.clearFailedLoginAttempts(user.usuarioId);
    } catch (err) {
      // No bloqueamos el login si falla el reset; lo registramos.
      this.logger.warn(
        `[LOGIN] No se pudieron limpiar contadores de lockout: user=${user.usuarioId} | ${err}`,
      );
    }

    const sesionId = randomUUID();

    // Generar tokens
    const tokens = await this.generateJwtToken(
      user.usuarioId,
      sesionId,
      user.email,
    );

    // Guardar sesión
    const hashRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    const expiraEn = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    try {
      await this.sessionsService.createSession({
        sesionId,
        hashRefreshToken,
        direccionIp: ip,
        usuarioAgente: userAgent,
        revocado: false,
        expiraEn,
        usuarioId: user.usuarioId,
      });
    } catch (err) {
      this.logger.error(
        `[SESSIONS] Error al guardar sesión: sesionId=${sesionId} | ${err}`,
      );
      throw new InternalServerErrorException(
        'Error al crear sesión. Intente nuevamente.',
      );
    }

    return this.buildLoginResponse(user, sesionId, tokens);
  }

  private async validateUser(
    loginUserDto: LoginUserDto,
  ): Promise<ValidatedUser> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findByEmailWithPassword(email);

    // Mismo mensaje para usuario inexistente / eliminado / password incorrecta
    // para no filtrar información. El lockout por cuenta solo se activa si el
    // usuario existe y no fue borrado.
    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Si la cuenta está bloqueada, no se valida la contraseña y se devuelve
    // el mensaje genérico de credenciales inválidas para no filtrar la
    // existencia de la cuenta.
    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      const minutesRemaining = Math.max(
        1,
        Math.ceil((user.bloqueadoHasta.getTime() - Date.now()) / (60 * 1000)),
      );
      this.logger.warn(
        `[LOGIN] Cuenta bloqueada: user=${user.usuarioId} | hasta=${user.bloqueadoHasta.toISOString()}`,
      );
      throw new UnauthorizedException(
        `Cuenta bloqueada temporalmente. Intenta en ${minutesRemaining} minutos.`,
      );
    }

    const isPasswordValid = await bcrypt.compare(password, user.clave);
    if (!isPasswordValid) {
      try {
        const result = await this.userRepository.recordFailedLoginAttempt(
          user.usuarioId,
          LOCKOUT_OPTIONS,
        );
        if (result.bloqueadoHasta && result.bloqueadoHasta > new Date()) {
          this.logger.warn(
            `[LOGIN] Cuenta bloqueada por umbral de intentos fallidos: user=${user.usuarioId}`,
          );
          throw new UnauthorizedException(
            'Cuenta bloqueada temporalmente. Intenta en 30 minutos.',
          );
        }
      } catch (err) {
        if (err instanceof UnauthorizedException) throw err;
        this.logger.error(
          `[LOGIN] Error al registrar intento fallido: user=${user.usuarioId} | ${err}`,
        );
      }
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  private async generateJwtToken(
    userId: number,
    sessionId: string,
    email: string,
  ) {
    const payload = { sub: userId, sid: sessionId, email };
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private buildLoginResponse(
    user: ValidatedUser,
    sesionId: string,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const decodedAccess = this.decodeJwtClaims(
      this.jwtService.decode(tokens.accessToken),
    );
    const decodedRefresh = this.decodeJwtClaims(
      this.jwtService.decode(tokens.refreshToken),
    );

    const toDate = (ts?: number) =>
      ts ? EcuadorTimezoneUtil.formatAsEcuadorISO(new Date(ts * 1000)) : null;

    const fullName =
      user.nombres && user.apellidos
        ? `${user.nombres} ${user.apellidos}`
        : user.nombres || user.apellidos || null;

    // Si el rol está eliminado, no devolver roleId ni roleName
    const isRoleActive = user.rol && user.rol.deletedAt === null;

    return {
      sub: user.usuarioId,
      sid: sesionId,
      nombre: fullName,
      avatar: user.avatar,
      email: user.email,
      rolId: isRoleActive && user.rol ? user.rol.rolId : null,
      nombreRol: isRoleActive ? (user.rol?.nombre ?? null) : null,
      roles: isRoleActive && user.rol ? [user.rol.rolId] : [],
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenInfo: {
        iat: decodedAccess?.iat,
        exp: decodedAccess?.exp,
        iatDate: toDate(decodedAccess?.iat),
        expDate: toDate(decodedAccess?.exp),
      },
      refreshTokenInfo: {
        iat: decodedRefresh?.iat,
        exp: decodedRefresh?.exp,
        iatDate: toDate(decodedRefresh?.iat),
        expDate: toDate(decodedRefresh?.exp),
      },
    };
  }

  private decodeJwtClaims(value: unknown): DecodedJwt {
    if (!value || typeof value !== 'object') return {};
    const claims = value as Record<string, any>;
    return { iat: claims.iat, exp: claims.exp };
  }
}
