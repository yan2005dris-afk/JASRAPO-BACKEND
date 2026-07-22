import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomBytes, timingSafeEqual } from 'crypto';
import { UserRepository } from '../../../users/domain/repositories/user.repository';
import { SessionsService } from '../../../sessions/application/sessions.service';
import { REFRESH_TOKEN_MAX_AGE_MS } from 'src/infrastructure/config/app.constants';
import { EcuadorTimezoneUtil } from 'src/shared/utils/ecuador-timezone.util';
import type { StringValue } from 'ms';
import type { JwtRefreshPayload } from '../../interfaces/http/types/JwtRequest.types';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class RefreshAccessTokenUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
    private readonly logger: LoggerService,
  ) {}

  // TODO(security/refresh-family): add family tracking — issue #150
  // The current implementation only checks the single session row and
  // does not detect refresh-token reuse across a token family. To
  // close the OWASP A07 gap, persist a `familyId` column on `sesiones`
  // (Prisma migration), generate a UUID on login, stamp it on every
  // rotated refresh token, and revoke every row sharing the family
  // whenever a refresh token is presented twice. Requires:
  //   - schema migration (Sesiones.familyId String?, index)
  //   - SessionsService.createSession / rotateSession signature
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
    const payload = await this.verifyRefreshToken(refreshToken);
    const tokenVersion = payload.tokenVersion ?? 1;

    if (
      payload.sid !== sesionId ||
      payload.sub !== usuarioId ||
      !Number.isInteger(tokenVersion) ||
      tokenVersion < 1
    ) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const session = await this.sessionsService.getSession(usuarioId, sesionId);

    if (!session || session.revocado || session.expiraEn < new Date()) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    if (session.tokenVersion !== tokenVersion) {
      await this.revokeOnReplay(sesionId, usuarioId, ip, 'stale tokenVersion');
      throw new UnauthorizedException('Refresh token replay detected');
    }

    if (
      !this.matchesSessionSecret(payload.sessionSecret, session.sessionSecret)
    ) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.userRepository.findById(usuarioId);

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const nextTokenVersion = tokenVersion + 1;
    const newSessionSecret = randomBytes(32).toString('hex');
    const tokens = await this.generateJwtToken(
      usuarioId,
      sesionId,
      user.email,
      nextTokenVersion,
      newSessionSecret,
    );
    const expiraEn = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    let affectedRows: number;
    try {
      affectedRows = await this.sessionsService.rotateSession(sesionId, {
        expectedTokenVersion: tokenVersion,
        sessionSecret: newSessionSecret,
        direccionIp: ip,
        usuarioAgente: userAgent,
        expiraEn,
      });
    } catch (err) {
      this.logger.error(
        `[SESSIONS] Error al rotar sesión: sesionId=${sesionId} | ${err}`,
      );
      throw new InternalServerErrorException('Error al actualizar sesión.');
    }

    if (affectedRows === 0) {
      // Otra request rotó primero (o la sesión dejó de estar viva entre la
      // lectura y el UPDATE): es un replay. Revoca toda la sesión para que el
      // token del atacante también muera.
      await this.revokeOnReplay(sesionId, usuarioId, ip, 'lost atomic rotate');
      throw new UnauthorizedException('Refresh token replay detected');
    }

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      accessTokenInfo: this.buildTokenInfo(tokens.accessToken),
    };
  }

  private async verifyRefreshToken(
    refreshToken: string,
  ): Promise<JwtRefreshPayload> {
    try {
      return await this.jwtService.verifyAsync<JwtRefreshPayload>(
        refreshToken,
        {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }

  private matchesSessionSecret(
    jwtSessionSecret: string | undefined,
    sessionSecret: string,
  ) {
    if (
      !jwtSessionSecret ||
      !/^[0-9a-f]{64}$/i.test(jwtSessionSecret) ||
      !/^[0-9a-f]{64}$/i.test(sessionSecret)
    ) {
      return false;
    }

    const jwtSecretBuffer = Buffer.from(jwtSessionSecret, 'hex');
    const sessionSecretBuffer = Buffer.from(sessionSecret, 'hex');

    return (
      jwtSecretBuffer.length === sessionSecretBuffer.length &&
      timingSafeEqual(jwtSecretBuffer, sessionSecretBuffer)
    );
  }

  private async revokeOnReplay(
    sesionId: string,
    usuarioId: number,
    ip: string,
    reason: string,
  ): Promise<void> {
    this.logger.warn(
      `[SECURITY] Refresh replay detectado: sesionId=${sesionId} usuarioId=${usuarioId} ip="${ip}" motivo="${reason}"`,
    );
    try {
      // Reuse de un refresh token = posible robo. Revoca TODAS las sesiones del
      // usuario (no solo esta), para invalidar también el token del atacante
      // que pueda vivir en otra sesión/familia (OWASP A07, issue #150).
      const revoked =
        await this.sessionsService.revokeAllUserSessions(usuarioId);
      this.logger.warn(
        `[SECURITY] Sesiones revocadas por replay: usuarioId=${usuarioId} count=${revoked}`,
      );
    } catch (err) {
      // La revocación es best-effort: nunca debe enmascarar el 401 de replay.
      this.logger.error(
        `[SECURITY] No se pudieron revocar sesiones tras replay: usuarioId=${usuarioId} | ${err}`,
      );
    }
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
    tokenVersion: number,
    sessionSecret: string,
  ) {
    const accessPayload = {
      sub: userId,
      sid: sessionId,
      email,
      tokenVersion,
    };
    const refreshPayload = { ...accessPayload, sessionSecret };
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');

    const accessExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_ACCESS_EXPIRES_IN',
    );
    const refreshExpiresIn = this.config.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRES_IN',
    );

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn,
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn,
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
