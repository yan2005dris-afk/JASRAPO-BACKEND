import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { SessionsService } from '../../../sessions/application/sessions.service';
import * as bcrypt from 'bcryptjs';
import { REFRESH_TOKEN_MAX_AGE_MS } from 'src/infrastructure/config/app.constants';
import { EcuadorTimezoneUtil } from 'src/shared/utils/ecuador-timezone.util';
import type { StringValue } from 'ms';

@Injectable()
export class RefreshAccessTokenUseCase {
  private readonly logger = new Logger(RefreshAccessTokenUseCase.name);

  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  // TODO(security/refresh-family): add family tracking — issue #150
  // The current implementation only checks the single session row and
  // does not detect refresh-token reuse across a token family. To
  // close the OWASP A07 gap, persist a `familyId` column on `sesiones`
  // (Prisma migration), generate a UUID on login, stamp it on every
  // rotated refresh token, and revoke every row sharing the family
  // whenever a refresh token is presented twice. Requires:
  //   - schema migration (Sesiones.familyId String?, index)
  //   - SessionsService.createSession / updateSession signature
  //   - detection path on second-use + cascade revocation
  //   - reuse-detection test (Testcontainers integration spec)
  // Out of scope for the TTL/ceiling PR; tracked separately.

  async execute(
    sesionId: string,
    refreshToken: string,
    ip: string = 'unknown',
    userAgent: string = 'unknown',
    usuarioId: number,
  ) {
    const session = await this.sessionsService.getSession(usuarioId, sesionId);

    if (!session || session.revocado || session.expiraEn < new Date()) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const isValid = await bcrypt.compare(
      refreshToken,
      session.hashRefreshToken,
    );
    if (!isValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userRepository.findById(usuarioId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Rotar tokens
    const tokens = await this.generateJwtToken(usuarioId, sesionId, user.email);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    const expiraEn = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    try {
      await this.sessionsService.updateSession(sesionId, {
        hashRefreshToken: newHash,
        direccionIp: ip,
        usuarioAgente: userAgent,
        revocado: false,
        expiraEn,
      });
    } catch (err) {
      this.logger.error(
        `[SESSIONS] Error al rotar sesión: sesionId=${sesionId} | ${err}`,
      );
      throw new InternalServerErrorException('Error al actualizar sesión.');
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenInfo: this.buildTokenInfo(tokens.accessToken),
    };
  }

  private buildTokenInfo(token: string) {
    const decoded = this.jwtService.decode(token);
    const toDate = (ts?: number) =>
      ts ? EcuadorTimezoneUtil.formatAsEcuadorISO(new Date(ts * 1000)) : null;

    return {
      iat: decoded?.iat,
      exp: decoded?.exp,
      iatDate: toDate(decoded?.iat),
      expDate: toDate(decoded?.exp),
    };
  }

  private async generateJwtToken(
    userId: number,
    sessionId: string,
    email: string,
  ) {
    const payload = { sub: userId, sid: sessionId, email };
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(payload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
