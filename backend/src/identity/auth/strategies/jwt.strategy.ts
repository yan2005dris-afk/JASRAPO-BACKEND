import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/identity/users/user.service';
import { SessionsService } from '../../sessions/sessions.service';
import type { JwtAccessPayload } from '../types/JwtRequest.types';

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

  async validate(payload: JwtAccessPayload) {
    const { sub: usersId, sid: sessionsId, email } = payload;
    if (!usersId || !sessionsId) {
      throw new UnauthorizedException('Session invalida');
    }
    const session = await this.sessionsService.getSession(usersId, sessionsId);
    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
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
