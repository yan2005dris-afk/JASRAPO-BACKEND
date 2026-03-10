import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { EcuadorTimezoneUtil } from 'src/common/util/ecuador-timezone-backend.util';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/modules/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { RedisSessionService } from '../redis/redis-session.service';
const REDIS_SESSION_TTL = process.env.REDIS_SESSION_TTL ? Number(process.env.REDIS_SESSION_TTL) : 60 * 60 * 24 * 7; // 7 días en segundos
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
    this.logger.log('[REDIS] RedisSessionService inyectado. Listo para sesiones en Redis.');
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
    existingRefreshToken?: string,
  ) {
    const users = await this.validateUser(loginUserDto);
    const safeIp = ip ?? 'unknown';
    const safeAgent = userAgent ?? 'unknown';
    this.logger.log(`[LOGIN] user=${users.usersId} | ip="${safeIp}"`);

    // ── Siempre crear sesión nueva ──
    const sessionsId = Date.now(); // o usa uuid si prefieres
    const sessionKey = `session:${users.usersId}:${sessionsId}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;
    const session = {
      sessionsId,
      usersId: users.usersId,
      ipAddress: safeIp,
      userAgent: safeAgent,
      isRevoked: false,
      expiresAt,
    };
    const tokens = await this.actualizarSesionTokensRedis({ ...session, email: users.email }, {}, sessionKey);
    return this.buildLoginResponse(users, sessionsId, tokens);
  }

  /**
   * Construye el objeto de respuesta estándar del login.
   */
  private async buildLoginResponse(
    users: { usersId: number; email: string },
    sessionsId: number,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    const { accessToken, refreshToken } = tokens;
    const decodedAccess: any = this.jwtService.decode(accessToken);
    const decodedRefresh: any = this.jwtService.decode(refreshToken);

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
    const avatarMeta = profile?.avatar as Record<string, any> | null;
    const avatarKey = avatarMeta?.key ?? null;

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
    session: { usersId: number; sessionsId: number; email?: string },
    extraData: Record<string, any> = {},
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
      createdAt: (session as any).createdAt ?? Date.now(),
      expiresAt:
        typeof (session as any).expiresAt === 'number' && !isNaN((session as any).expiresAt)
          ? (session as any).expiresAt
          : (Date.now() + REDIS_SESSION_TTL * 1000),
    };
    this.logger.log(`[REDIS] [IOREDIS] Intentando guardar sesión en Redis: ${sessionKey}`);
    try {
      await this.redisSessionService.setSession(updatedSession, REDIS_SESSION_TTL);
      this.logger.log(`[REDIS] [IOREDIS] Sesión guardada correctamente en Redis: ${sessionKey}`);
    } catch (err) {
      this.logger.error(`[REDIS] [IOREDIS] Error al guardar sesión en Redis: ${sessionKey} | ${err}`);
    }
    return tokens;
  }

  /**
   * Genera el par de tokens JWT (accessToken + refreshToken).
   */
  private async generateJwtToken(
    userId: number,
    sessionId: number,
    email: string,
  ) {
    const payload = { sub: userId, sid: sessionId, email };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret: this.config.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<any>('JWT_ACCESS_EXPIRES_IN'),
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.getOrThrow<any>('JWT_REFRESH_EXPIRES_IN'),
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
    sessionId: number,
    refreshToken: string,
    ip: string = 'unknown',
    userAgent: string = 'unknown',
    userId: number,
  ) {
    // Buscar sesión en Redis usando ioredis (clave: session:userId:sessionId)
    let session = await this.redisSessionService.getSession(userId, sessionId);
    if (!session || typeof session !== 'object' || Object.keys(session).length === 0) {
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
  async logout(sessionId: number, userId: number) {
    // Borrado lógico: solo marcar como revocada, no eliminar de Redis
    const session = await this.redisSessionService.getSession(userId, sessionId);
    if (session) {
      session.isRevoked = true;
      await this.redisSessionService.setSession(session, Math.floor((session.expiresAt - Date.now()) / 1000));
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
}
