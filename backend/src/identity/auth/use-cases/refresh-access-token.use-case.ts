import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { SessionsService } from '../../sessions/sessions.service';
import * as bcrypt from 'bcryptjs';
import { REFRESH_TOKEN_MAX_AGE_MS } from 'src/infrastructure/config/app.constants';
import type { StringValue } from 'ms';

@Injectable()
export class RefreshAccessTokenUseCase {
  private readonly logger = new Logger(RefreshAccessTokenUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    private readonly sessionsService: SessionsService,
  ) {}

  async execute(
    sessionId: string,
    refreshToken: string,
    ip: string = 'unknown',
    userAgent: string = 'unknown',
    userId: number,
  ) {
    const session = await this.sessionsService.getSession(userId, sessionId);
    
    if (!session || session.isRevoked || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesión inválida o expirada');
    }

    const isValid = await bcrypt.compare(refreshToken, session.refreshTokenHash);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    const user = await this.prisma.users.findUnique({
      where: { usersId: userId },
      select: { email: true },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    // Rotar tokens
    const tokens = await this.generateJwtToken(userId, sessionId, user.email);
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_MAX_AGE_MS);

    try {
      await this.sessionsService.updateSession(sessionId, {
        refreshTokenHash: newHash,
        ipAddress: ip,
        userAgent: userAgent,
        isRevoked: false,
        expiresAt,
      });
    } catch (err) {
      this.logger.error(`[SESSIONS] Error al rotar sesión: sessionsId=${sessionId} | ${err}`);
      throw new InternalServerErrorException('Error al actualizar sesión.');
    }

    return tokens;
  }

  private async generateJwtToken(userId: number, sessionId: string, email: string) {
    const payload = { sub: userId, sid: sessionId, email };
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    
    const accessExpiresIn = this.config.getOrThrow<StringValue>('JWT_ACCESS_EXPIRES_IN');
    const refreshExpiresIn = this.config.getOrThrow<StringValue>('JWT_REFRESH_EXPIRES_IN');

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { secret: accessSecret, expiresIn: accessExpiresIn }),
      this.jwtService.signAsync(payload, { secret: refreshSecret, expiresIn: refreshExpiresIn }),
    ]);

    return { accessToken, refreshToken };
  }
}
