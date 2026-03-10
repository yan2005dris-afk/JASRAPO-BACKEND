import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';
import { RedisSessionService } from '../../redis/redis-session.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly redisSessionService: RedisSessionService,
  ) {
    const secret = config.get<string>('JWT_ACCESS_SECRET');
    if (!secret) {
      throw new UnauthorizedException('Session invalida');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    const { sub: usersId, sid: sessionsId, email } = payload;
    if (!usersId || !sessionsId) {
      throw new UnauthorizedException('Session invalida');
    }
    // Buscar sesión en Redis usando RedisSessionService
    let session: any = null;
    try {
      session = await this.redisSessionService.getSession(usersId, sessionsId);
    } catch (err) {
      throw new UnauthorizedException('Error accediendo a Redis para sesión');
    }
    if (!session || session.isRevoked || session.expiresAt < Date.now()) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
    // Recalcula permisos en cada request autenticada para reflejar cambios de inmediato.
    const permissions = await this.userService.getEffectivePermissions(usersId);
    return {
      sub: usersId,
      usersId,
      sid: sessionsId,
      email,
      permissions,
    };
  }
}
