import {
  Inject,
  Injectable,
  InternalServerErrorException,
  forwardRef,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SessionsService } from '../../../sessions/application/sessions.service';
import { LoginUserDto } from '../../interfaces/dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { randomBytes, randomUUID } from 'crypto';
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
import {
  GetEffectivePermissionsUseCase,
  SessionCapability,
} from '../../../users/application/use-cases/get-effective-permissions.use-case';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';
import { UnauthorizedDomainException } from 'src/shared/domain/exceptions/domain.exception';

interface ValidatedUser {
  usuarioId: number;
  email: string;
  clave: string | null;
  deletedAt?: Date | null;
  nombres: string | null;
  apellidos: string | null;
  avatar?: unknown;
  rol: { rolId: number; nombre: string; deletedAt?: Date | null } | null;
}

const LOCKOUT_OPTIONS = {
  threshold: LOGIN_LOCKOUT_THRESHOLD,
  windowMs: LOGIN_LOCKOUT_WINDOW_MS,
  lockoutDurationMs: LOGIN_LOCKOUT_DURATION_MS,
} as const;

const DEFAULT_BCRYPT_COST = 12;
const MIN_BCRYPT_COST = 4;
const MAX_BCRYPT_COST = 15;

@LogContext()
@Injectable()
export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly logger: LoggerService,
    @Inject(forwardRef(() => GetEffectivePermissionsUseCase))
    private readonly getEffectivePermissionsUseCase: GetEffectivePermissionsUseCase,
  ) {}

  async execute(
    loginUserDto: LoginUserDto,
    ip: string = 'unknown',
    userAgent: string = 'unknown',
  ) {
    const user = await this.validateUser(loginUserDto);
    this.logger.log(`[LOGIN] user=${user.usuarioId} | ip="${ip}"`);

    try {
      await this.userRepository.clearFailedLoginAttempts(user.usuarioId);
    } catch (err) {
      this.logger.warn(
        `[LOGIN] No se pudieron limpiar contadores de lockout: user=${user.usuarioId} | ${err}`,
      );
    }

    await this.maybeUpgradePasswordHash(user, loginUserDto.password);

    const sesionId = randomUUID();
    const sessionSecret = randomBytes(32).toString('hex');
    const tokenVersion = 1;

    const tokens = await this.generateJwtToken(
      user.usuarioId,
      sesionId,
      user.email,
      tokenVersion,
      sessionSecret,
    );

    const expiraEn = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    try {
      await this.sessionsService.createSession({
        sesionId,
        sessionSecret,
        tokenVersion,
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

    const capabilities =
      await this.getEffectivePermissionsUseCase.getCapabilities(user.usuarioId);

    return this.buildLoginResponse(user, sesionId, tokens, capabilities);
  }

  private async validateUser(
    loginUserDto: LoginUserDto,
  ): Promise<ValidatedUser> {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findByEmailWithPassword(email);

    if (!user || user.deletedAt) {
      throw new UnauthorizedDomainException('Credenciales inválidas');
    }

    if (user.bloqueadoHasta && user.bloqueadoHasta > new Date()) {
      const minutesRemaining = Math.max(
        1,
        Math.ceil((user.bloqueadoHasta.getTime() - Date.now()) / (60 * 1000)),
      );
      this.logger.warn(
        `[LOGIN] Cuenta bloqueada: user=${user.usuarioId} | hasta=${user.bloqueadoHasta.toISOString()}`,
      );
      throw new UnauthorizedDomainException(
        `Cuenta bloqueada temporalmente. Intenta en ${minutesRemaining} minutos.`,
      );
    }

    // Usuario nuevo sin contraseña aceptada (aún pendiente de invitación)
    if (!user.clave) {
      this.logger.warn(
        `[LOGIN] Intento de login en usuario sin contraseña configurada: user=${user.usuarioId}`,
      );
      throw new UnauthorizedDomainException(
        'Debe aceptar la invitación por email antes de iniciar sesión.',
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
          throw new UnauthorizedDomainException(
            'Cuenta bloqueada temporalmente. Intenta en 30 minutos.',
          );
        }
      } catch (err) {
        if (err instanceof UnauthorizedDomainException) throw err;
        this.logger.error(
          `[LOGIN] Error al registrar intento fallido: user=${user.usuarioId} | ${err}`,
        );
      }
      throw new UnauthorizedDomainException('Credenciales inválidas');
    }

    return user;
  }

  private getBcryptCost(): number {
    const raw = this.config.get<unknown>('BCRYPT_COST', DEFAULT_BCRYPT_COST);
    const parsed = Number(raw);
    if (
      !Number.isFinite(parsed) ||
      parsed < MIN_BCRYPT_COST ||
      parsed > MAX_BCRYPT_COST
    ) {
      return DEFAULT_BCRYPT_COST;
    }
    return Math.trunc(parsed);
  }

  private async maybeUpgradePasswordHash(
    user: ValidatedUser,
    plainPassword: string,
  ): Promise<void> {
    const bcryptCost = this.getBcryptCost();

    let currentRounds: number;
    try {
      currentRounds = bcrypt.getRounds(user.clave);
    } catch {
      return;
    }

    if (Number.isFinite(currentRounds) && currentRounds >= bcryptCost) {
      return;
    }

    try {
      const newHash = await bcrypt.hash(plainPassword, bcryptCost);
      await this.userRepository.update(user.usuarioId, { clave: newHash });
    } catch (err) {
      this.logger.warn(
        `[LOGIN] No se pudo actualizar el cost factor bcrypt: user=${user.usuarioId} | ${err}`,
      );
    }
  }

  private async generateJwtToken(
    userId: number,
    sessionId: string,
    email: string,
    tokenVersion: number,
    sessionSecret: string,
  ) {
    const accessPayload = {
      sub: userId,
      sid: sessionId,
      email,
      tokenVersion,
    };
    const refreshPayload = { ...accessPayload, sessionSecret };
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
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
    capabilities: SessionCapability[],
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
      capabilities,
    };
  }

  private decodeJwtClaims(value: unknown): DecodedJwt {
    if (!value || typeof value !== 'object') return {};
    const claims = value as Record<string, any>;
    return { iat: claims.iat, exp: claims.exp };
  }
}
