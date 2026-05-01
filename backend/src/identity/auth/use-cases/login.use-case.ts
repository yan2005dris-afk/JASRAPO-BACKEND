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
    this.logger.log(`[LOGIN] user=${user.usersId} | ip="${ip}"`);

    const sessionsId = randomUUID();
    
    // Generar tokens
    const tokens = await this.generateJwtToken(user.usersId, sessionsId, user.email);
    
    // Guardar sesión
    const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, 10);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    try {
      await this.sessionsService.createSession({
        sessionsId,
        refreshTokenHash,
        ipAddress: ip,
        userAgent: userAgent,
        isRevoked: false,
        expiresAt,
        user: { connect: { usersId: user.usersId } },
      });
    } catch (err) {
      this.logger.error(`[SESSIONS] Error al guardar sesión: sessionsId=${sessionsId} | ${err}`);
      throw new InternalServerErrorException('Error al crear sesión. Intente nuevamente.');
    }

    return this.buildLoginResponse(user, sessionsId, tokens);
  }

  private async validateUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.prisma.users.findUnique({ where: { email } });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    return user;
  }

  private async generateJwtToken(userId: number, sessionId: string, email: string) {
    const payload = { sub: userId, sid: sessionId, email };
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    
    const accessExpiresIn = this.config.getOrThrow<StringValue>('JWT_ACCESS_EXPIRES_IN');
    const refreshExpiresIn = this.config.getOrThrow<StringValue>('JWT_REFRESH_EXPIRES_IN');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExpiresIn }),
    ]);

    return { accessToken, refreshToken };
  }

  private async buildLoginResponse(
    user: { usersId: number; email: string },
    sessionsId: string,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const decodedAccess = this.decodeJwtClaims(this.jwtService.decode(tokens.accessToken));
    const decodedRefresh = this.decodeJwtClaims(this.jwtService.decode(tokens.refreshToken));

    const [userWithRole, profile] = await Promise.all([
      this.prisma.users.findUnique({
        where: { usersId: user.usersId },
        select: {
          rolesId: true,
          role: { select: { name: true, deletedAt: true } },
        },
      }),
      this.prisma.profiles.findUnique({
        where: { usersId: user.usersId },
        select: { firstName: true, lastName: true, avatar: true },
      }),
    ]);

    const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') || null;
    const avatarKey = (profile?.avatar as any)?.key || null;

    const firstRole =
      userWithRole?.role && !userWithRole.role.deletedAt
        ? { rolesId: userWithRole.rolesId, name: userWithRole.role.name }
        : null;

    const toDate = (ts?: number) =>
      ts ? EcuadorTimezoneUtil.formatAsEcuadorISO(new Date(ts * 1000)) : null;

    return {
      sub: user.usersId,
      sid: sessionsId,
      name: fullName,
      avatar: avatarKey,
      email: user.email,
      roleId: firstRole?.rolesId ?? null,
      roleName: firstRole?.name ?? null,
      roles: firstRole?.rolesId ? [firstRole.rolesId] : [],
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
