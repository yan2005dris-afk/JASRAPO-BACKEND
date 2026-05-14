import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SessionsService } from '../../sessions/sessions.service';
import { LoginUserDto } from '../dto/login-user.dto';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { REFRESH_TOKEN_MAX_AGE_MS } from 'src/infrastructure/config/app.constants';
import { EcuadorTimezoneUtil } from 'src/infrastructure/common/util/ecuador-timezone-backend.util';
import type { DecodedJwt } from '../types/auth-service.types';
import type { StringValue } from 'ms';

interface ValidatedUser {
  usuarioId: number;
  email: string;
  clave: string;
  deletedAt: Date | null;
}

@Injectable()
export class LoginUseCase {
  private readonly logger = new Logger(LoginUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  async execute(
    loginUserDto: LoginUserDto,
    ip: string = 'unknown',
    userAgent: string = 'unknown',
  ) {
    const user = await this.validateUser(loginUserDto);
    this.logger.log(`[LOGIN] user=${user.usuarioId} | ip="${ip}"`);

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
        usuario: { connect: { usuarioId: user.usuarioId } },
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

  private async validateUser(loginUserDto: LoginUserDto): Promise<ValidatedUser> {
    const { email, password } = loginUserDto;
    const user = await this.prisma.usuarios.findUnique({
      where: { email },
      select: {
        usuarioId: true,
        email: true,
        clave: true,
        deletedAt: true,
      },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.clave);
    if (!isPasswordValid) {
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

    return {
      sub: user.usuarioId,
      sid: sesionId,
      name: null,
      avatar: null,
      email: user.email,
      roleId: null,
      roleName: null,
      roles: [],
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
