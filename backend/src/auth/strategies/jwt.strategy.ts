import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly userService: UserService,
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

    const session = await this.prisma.sessions.findUnique({
      where: { sessionsId },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    // getEffectivePermissions valida existencia, deleted, roles y permisos individuales
    const permissions = await this.userService.getEffectivePermissions(usersId);

    return {
      sub: usersId,
      usersId,
      sid: sessionsId,
      email, // viene del payload JWT — sin query extra a BD
      permissions,
    };
  }
}
