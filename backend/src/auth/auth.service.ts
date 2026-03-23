import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { EcuadorTimezoneUtil } from 'src/common/util/ecuador-timezone-backend.util';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/modules/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { RedisSessionService } from '../redis/redis-session.service';
import type { SessionRedis } from 'src/common/types/session-redis.interface';
import type { DecodedJwt, SessionBase } from './types/auth-service.types';
import {
  REDIS_SESSION_TTL_SECONDS,
  REFRESH_TOKEN_MAX_AGE_MS,
} from 'src/constants/app.constants';
import type { StringValue } from 'ms';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  // Log Redis connection status at service startup
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    // cacheManager eliminado, solo ioredis
    private readonly redisSessionService: RedisSessionService,
  ) {
    this.logger.log(
      '[REDIS] RedisSessionService inyectado. Listo para sesiones en Redis.',
    );
  }

  /**
   * Registra un nuevo usuario
   * @param email correo del usuario
   * @param password contraseña del usuario
   * @returns mensaje de éxito o lanza excepción si el correo ya existe
   */
  async register({ email, password }: RegisterDto) {
    const user = await this.userService.user({ email });

    if (user) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const newUser = await this.userService.createUser({
      email,
      password: await bcrypt.hash(password, 10),
    });

    if (newUser) {
      return 'El registro fue exitoso';
    } else {
      throw new BadRequestException('Error al registrar el usuario');
    }
  }

  /**
   * Inicia sesión con credenciales.
   * Si el browser envía un refreshToken en cookie y coincide con una sesión activa
   * para el mismo dispositivo (userAgent), rota los tokens sin crear sesión nueva.
   * Si no, crea una sesión nueva.
   */
  async login(
    loginUserDto: LoginUserDto,
    ip?: string,
    userAgent?: string,
    _existingRefreshToken?: string,
  ) {
    const users = await this.validateUser(loginUserDto);
    const safeIp = ip ?? 'unknown';
    const safeAgent = userAgent ?? 'unknown';
    this.logger.log(`[LOGIN] user=${users.usersId} | ip="${safeIp}"`);

    // ── Siempre crear sesión nueva ──
    const sessionsId = randomUUID();
    const sessionKey = `session:${users.usersId}:${sessionsId}`;
    const expiresAt = Date.now() + REFRESH_TOKEN_MAX_AGE_MS;
    const session = {
      sessionsId,
      usersId: users.usersId,
      ipAddress: safeIp,
      userAgent: safeAgent,
      isRevoked: false,
      expiresAt,
    };
    const tokens = await this.actualizarSesionTokensRedis(
      { ...session, email: users.email },
      {},
      sessionKey,
    );
    return this.buildLoginResponse(users, sessionsId, tokens);
  }

  /**
   * Construye el objeto de respuesta estándar del login.
   */
  private async buildLoginResponse(
    users: { usersId: number; email: string },
    sessionsId: string,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const { accessToken, refreshToken } = tokens;
    const decodedAccess = this.decodeJwtClaims(
      this.jwtService.decode(accessToken),
    );
    const decodedRefresh = this.decodeJwtClaims(
      this.jwtService.decode(refreshToken),
    );

    // Ejecutar en paralelo: rol principal (con nombre) y perfil del usuario
    const [userWithRole, profile] = await Promise.all([
      this.prisma.users.findUnique({
        where: { usersId: users.usersId },
        select: {
          rolesId: true,
          role: { select: { name: true, deletedAt: true } },
        },
      }),
      this.prisma.profiles.findUnique({
        where: { usersId: users.usersId },
        select: { firstName: true, lastName: true, avatar: true },
      }),
    ]);

    // Construir nombre completo a partir del perfil (null si no tiene perfil aún)
    const nameParts = [profile?.firstName, profile?.lastName].filter(Boolean);
    const fullName = nameParts.length > 0 ? nameParts.join(' ') : null;

    // Extraer key del avatar (ahora es JSON con metadata)
    const avatarKey = this.getAvatarKey(profile?.avatar);

    const firstRole =
      userWithRole?.role && !userWithRole.role.deletedAt
        ? { rolesId: userWithRole.rolesId, name: userWithRole.role.name }
        : null;

    const toDate = (ts?: number) =>
      ts ? EcuadorTimezoneUtil.formatAsEcuadorISO(new Date(ts * 1000)) : null;

    return {
      sub: users.usersId,
      sid: sessionsId,
      name: fullName,
      avatar: avatarKey,
      email: users.email,
      roleId: firstRole?.rolesId ?? null,
      roleName: firstRole?.name ?? null,
      roles: firstRole?.rolesId ? [firstRole.rolesId] : [],
      accessToken,
      refreshToken,
      accessTokenInfo: {
        iat: decodedAccess?.iat,
        exp: decodedAccess?.exp,
        iatDate: toDate(decodedAccess?.iat),
        expDate: toDate(decodedAccess?.exp),
      },
      refreshTokenInfo: {
        iat: decodedRefresh?.iat,
        exp: decodedRefresh?.exp,
        iatDate: toDate(decodedRefresh?.iat),
        expDate: toDate(decodedRefresh?.exp),
      },
    };
  }

  /**
   * Genera nuevos JWT (access + refresh), hashea el refreshToken y
   * actualiza la sesión en BD en una sola operación.
   * @param session   - Objeto con { usersId, sessionsId }
   * @param extraData - Campos adicionales a actualizar (ej: ipAddress)
   */
  private async actualizarSesionTokensRedis(
    session: SessionBase,
    extraData: Record<string, unknown> = {},
    sessionKey: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.generateJwtToken(
      session.usersId,
      session.sessionsId,
      session.email ?? '',
    );
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    const updatedSession = {
      ...session,
      refreshToken: newHash,
      ...extraData,
      isRevoked: false,
      createdAt: session.createdAt ?? Date.now(),
      expiresAt:
        typeof session.expiresAt === 'number' && !isNaN(session.expiresAt)
          ? session.expiresAt
          : Date.now() + REDIS_SESSION_TTL_SECONDS * 1000,
    } as SessionRedis;
    this.logger.log(
      `[REDIS] [IOREDIS] Intentando guardar sesión en Redis: ${sessionKey}`,
    );
    try {
      await this.redisSessionService.setSession(
        updatedSession,
        REDIS_SESSION_TTL_SECONDS,
      );
      this.logger.log(
        `[REDIS] [IOREDIS] Sesión guardada correctamente en Redis: ${sessionKey}`,
      );
    } catch (err) {
      this.logger.error(
        `[REDIS] [IOREDIS] Error al guardar sesión en Redis: ${sessionKey} | ${err}`,
      );
      throw new InternalServerErrorException(
        'Error al crear sesión. Intente nuevamente.',
      );
    }
    return tokens;
  }

  /**
   * Genera el par de tokens JWT (accessToken + refreshToken).
   */
  private async generateJwtToken(
    userId: number,
    sessionId: string,
    email: string,
  ) {
    const payload = { sub: userId, sid: sessionId, email };
    const accessSecret = this.config.getOrThrow<string>('JWT_ACCESS_SECRET');
    const refreshSecret = this.config.getOrThrow<string>('JWT_REFRESH_SECRET');
    const accessExpiresIn = this.getJwtExpiresIn('JWT_ACCESS_EXPIRES_IN');
    const refreshExpiresIn = this.getJwtExpiresIn('JWT_REFRESH_EXPIRES_IN');

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: accessSecret,
      expiresIn: accessExpiresIn,
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Rota los tokens de una sesión existente validando el refreshToken.
   * Actualiza ip y userAgent en BD si cambiaron (sin rechazar — la cookie
   * httpOnly ya garantiza que es el mismo navegador).
   * Usado por POST /auth/refresh.
   *
   * @param sessionId    - ID de sesión (del payload JWT, campo `sid`)
   * @param refreshToken - Token en texto plano (cookie)
   * @param ip           - IP actual del cliente (req.ip)
   * @param userAgent    - User-Agent actual del cliente
   */
  async refreshAccessToken(
    sessionId: string,
    refreshToken: string,
    ip: string = 'unknown',
    userAgent: string = 'unknown',
    userId: number,
  ) {
    // Buscar sesión en Redis usando ioredis (clave: session:userId:sessionId)
    const session = await this.redisSessionService.getSession(
      userId,
      sessionId,
    );
    if (
      !session ||
      typeof session !== 'object' ||
      Object.keys(session).length === 0
    ) {
      throw new UnauthorizedException('Sesión no encontrada');
    }
    if (session.isRevoked) {
      throw new UnauthorizedException('La sesión ha sido revocada');
    }
    if (session.expiresAt < Date.now()) {
      throw new UnauthorizedException('La sesión ha expirado');
    }
    const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    // Construir la clave manualmente porque getSessionKey es privado
    const sessionKey = `session:${userId}:${sessionId}`;
    return this.actualizarSesionTokensRedis(
      { ...session, usersId: userId },
      { ipAddress: ip, userAgent },
      sessionKey,
    );
  }

  /**
   * Revoca una sesión en BD (logout).
   */
  async logout(sessionId: string, userId: number) {
    // Borrado lógico: solo marcar como revocada, no eliminar de Redis
    const session = await this.redisSessionService.getSession(
      userId,
      sessionId,
    );
    if (session) {
      session.isRevoked = true;
      await this.redisSessionService.setSession(
        session,
        Math.floor((session.expiresAt - Date.now()) / 1000),
      );
    }
  }

  /**
   * Valida las credenciales del usuario (email + password).
   * Lanza UnauthorizedException si no existe, está eliminado o la contraseña no coincide.
   * @returns usuario sin el campo password
   */
  async validateUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.prisma.users.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Usuario eliminado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  private decodeJwtClaims(value: unknown): DecodedJwt {
    if (!value || typeof value !== 'object') {
      return {};
    }

    const maybeClaims = value as Record<string, unknown>;
    const iat =
      typeof maybeClaims.iat === 'number' ? maybeClaims.iat : undefined;
    const exp =
      typeof maybeClaims.exp === 'number' ? maybeClaims.exp : undefined;
    return { iat, exp };
  }

  private getAvatarKey(avatar: unknown): string | null {
    if (!avatar || typeof avatar !== 'object') {
      return null;
    }

    const maybeKey = (avatar as Record<string, unknown>).key;
    return typeof maybeKey === 'string' ? maybeKey : null;
  }

  private getJwtExpiresIn(
    key: 'JWT_ACCESS_EXPIRES_IN' | 'JWT_REFRESH_EXPIRES_IN',
  ): StringValue {
    return this.config.getOrThrow<StringValue>(key);
  }
}
