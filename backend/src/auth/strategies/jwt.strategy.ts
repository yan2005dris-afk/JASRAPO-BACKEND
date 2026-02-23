import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { PrismaService } from 'src/database/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
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
    const { sub: usersId, sid: sessionsId } = payload;

    if (!usersId || !sessionsId) {
      throw new UnauthorizedException('Session invalida');
    }
    const session = await this.prisma.sessions.findUnique({
      where: { sessionsId },
    });

    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid session');
    }
    // Cargar usuario, roles y permisos
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      include: {
        userRoles: {
          include: {
            roles: {
              include: {
                rolPermissions: {
                  include: { permissions: true },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Usuario eliminado');
    }

    // Extraer permisos únicos
    const permissions = user.userRoles
      .flatMap((ur) => ur.roles.rolPermissions)
      .filter((rp) => rp.permissions && !rp.permissions.deletedAt)
      .map((rp) => ({
        resource: rp.permissions.resource,
        action: rp.permissions.action,
      }));

    return {
      usersId: user.usersId,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.roles.name),
      permissions,
      sessionId: sessionsId,
    };
  }
}
