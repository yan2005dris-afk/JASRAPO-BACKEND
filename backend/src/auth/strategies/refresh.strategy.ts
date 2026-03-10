import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/database/prisma.service'; // (Unused, kept for DI compatibility if needed)
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { RedisSessionService } from '../../redis/redis-session.service';

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
        (request: Request) => {
          return request?.cookies?.refreshToken;
        },
      ]),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: false,
    });
  }

  async validate(payload: any) {
    const { sub: usersId, sid: sessionsId, email } = payload;
    if (!usersId || !sessionsId) {
      throw new UnauthorizedException('Session invalida');
    }
    let session: any = null;
    try {
      session = await this.redisSessionService.getSession(usersId, sessionsId);
    } catch (err) {
      throw new UnauthorizedException('Error accediendo a Redis para sesión');
    }
    if (!session || session.isRevoked || session.expiresAt < Date.now()) {
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    return { sub: usersId, sessionsId, email };
  }
}
