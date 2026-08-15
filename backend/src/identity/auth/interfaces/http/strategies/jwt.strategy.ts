import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/identity/users/application/user.service';
import { SessionsService } from '../../../../sessions/application/sessions.service';
import type {
  JwtAccessPayload,
  JwtPayload,
} from '../../../application/types/jwt.types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly userService: UserService,
    private readonly sessionsService: SessionsService,
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

  async validate(payload: JwtAccessPayload): Promise<JwtPayload> {
    const { sub: usuarioId, sid: sesionId, email } = payload;
    if (!usuarioId || !sesionId) {
      throw new UnauthorizedException('Session invalida');
    }
    const session = await this.sessionsService.getSession(usuarioId, sesionId);
    const tokenVersion = payload.tokenVersion ?? 1;
    if (
      !session ||
      session.revocado ||
      session.expiraEn < new Date() ||
      session.tokenVersion !== tokenVersion
    ) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
    const { permisos } =
      await this.userService.getEffectivePermissions(usuarioId);
    return {
      sub: usuarioId,
      usersId: usuarioId,
      sid: sesionId,
      email,
      permisos,
    };
  }
}
