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
    console.log('JWT Access Secret:', secret); // Agrega este log para verificar el valor de la variable de entorno
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
      throw new Error('Invalid session');
    }
    const user = await this.prisma.users.findUnique({
      where: { usersId },
      include: {
        userRoles: {
          include: {
            roles: true,
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

    return {
      usersId: user.usersId,
      email: user.email,
      roles: user.userRoles.map((ur) => ur.roles.name),
      sessionId: sessionsId,
    };
  }
}
