import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/database/prisma.service'; // (Unused, kept for DI compatibility if needed)
import { ConfigService } from '@nestjs/config';
import { RedisSessionService } from '../../redis/redis-session.service';
import { SessionRedis } from 'src/common/types/session-redis.interface';
import type {
  JwtRefreshPayload,
  RequestWithCookies,
} from '../types/JwtRequest.types';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly prisma: PrismaService, // (Unused, kept for DI compatibility if needed)
    private readonly config: ConfigService,
    private readonly redisSessionService: RedisSessionService,
  ) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Session invalida');
    }
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: RequestWithCookies | undefined) =>
          this.getRefreshToken(request),
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  async validate(payload: JwtRefreshPayload) {
    const { sub: usersId, sid: sessionsId, email } = payload;
    if (!usersId || !sessionsId) {
      throw new UnauthorizedException('Session invalida');
    }
    let session: SessionRedis | null = null;
    try {
      session = await this.redisSessionService.getSession(usersId, sessionsId);
    } catch (_err) {
      throw new UnauthorizedException('Error accediendo a Redis para sesión');
    }
    if (!session || session.isRevoked || session.expiresAt < Date.now()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    return { sub: usersId, sessionsId, email };
  }

  private getRefreshToken(
    request: RequestWithCookies | undefined,
  ): string | null {
    const cookies = request?.cookies as unknown;
    if (!cookies || typeof cookies !== 'object') {
      return null;
    }

    const maybeToken = (cookies as Record<string, unknown>).refreshToken;
    return typeof maybeToken === 'string' ? maybeToken : null;
  }
}
