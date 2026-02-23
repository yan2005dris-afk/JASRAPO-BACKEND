import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/database/prisma.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    const secret = config.get<string>('JWT_REFRESH_SECRET');
    console.log('JWT Access Secret:', secret); // Agrega este log para verificar el valor de la variable de entorno
    if (!secret) {
      throw new UnauthorizedException('Session invalida');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
      ignoreExpiration: false,
      passReqToCallback: false,
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
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
    return { usersId, sessionsId };
  }
}
