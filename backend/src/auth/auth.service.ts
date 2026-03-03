import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/models/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EcuadorTimezoneUtil } from '../common/util/ecuador-timezone-backend.util';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) { }

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

    // ── ¿Hay cookie con refreshToken? Intentar reutilizar sesión existente ──
    if (existingRefreshToken) {
      this.logger.debug(`[LOGIN] cookie refreshToken (primeros 20 chars): "${existingRefreshToken.substring(0, 20)}..."`);
      this.logger.debug(`[LOGIN] userAgent buscado: "${safeAgent}"`);

      const existingSession = await this.prisma.sessions.findFirst({
        where: {
          usersId: users.usersId,
          userAgent: safeAgent,
          isRevoked: false,
          expiresAt: { gt: new Date() },
        },
        orderBy: { sessionsId: 'desc' },
      });

      if (existingSession) {
        const isValid = await bcrypt.compare(existingRefreshToken, existingSession.refreshToken);

        if (isValid) {
          const tokens = await this.actualizarSesionTokens(
            { ...existingSession, email: users.email },
            { ipAddress: safeIp, userAgent: safeAgent },
          );
          return this.buildLoginResponse(users, existingSession.sessionsId, tokens);
        }
      }
    }

    // ── Crear sesión nueva ──
    const session = await this.prisma.sessions.create({
      data: {
        usersId: users.usersId,
        refreshToken: '',
        ipAddress: safeIp,
        userAgent: safeAgent,
        isRevoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    const tokens = await this.actualizarSesionTokens({ ...session, email: users.email });
    return this.buildLoginResponse(users, session.sessionsId, tokens);
  }

  /**
   * Construye el objeto de respuesta estándar del login.
   */
  private async buildLoginResponse(users: { usersId: number; email: string }, sessionsId: number, tokens: { accessToken: string; refreshToken: string },) {
    const { accessToken, refreshToken } = tokens;
    const decodedAccess: any = this.jwtService.decode(accessToken);
    const decodedRefresh: any = this.jwtService.decode(refreshToken);

    const roles = await this.prisma.userRoles.findMany({
      where: { usersId: users.usersId },
      select: { rolesId: true },
    });

    const toDate = (ts?: number) => ts ? EcuadorTimezoneUtil.formatAsEcuadorISO(new Date(ts * 1000)) : null;

    return {
      sub: users.usersId,
      sid: sessionsId,
      name: null,
      avatar: null,
      email: users.email,
      roles: roles.map((r) => r.rolesId),
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
  private async actualizarSesionTokens(session: { usersId: number; sessionsId: number; email?: string }, extraData: Record<string, any> = {},): Promise<{ accessToken: string; refreshToken: string }> {
    const tokens = await this.generateJwtToken(session.usersId, session.sessionsId, session.email ?? '');
    const newHash = await bcrypt.hash(tokens.refreshToken, 10);
    await this.prisma.sessions.update({
      where: { sessionsId: session.sessionsId },
      data: { refreshToken: newHash, ...extraData },
    });
    return tokens;
  }

  /**
   * Genera el par de tokens JWT (accessToken + refreshToken).
   */
  private async generateJwtToken(userId: number, sessionId: number, email: string) {
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
  async refreshAccessToken(sessionId: number, refreshToken: string, ip: string = 'unknown', userAgent: string = 'unknown', email: string = '') {
    const session = await this.prisma.sessions.findUnique({
      where: { sessionsId: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Sesión no encontrada');
    }

    if (session.isRevoked) {
      throw new UnauthorizedException('La sesión ha sido revocada');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('La sesión ha expirado');
    }

    const isValid = await bcrypt.compare(refreshToken, session.refreshToken);
    if (!isValid) {
      throw new UnauthorizedException('Refresh token inválido');
    }
    return this.actualizarSesionTokens({ ...session, email }, { ipAddress: ip, userAgent });
  }


  /**
   * Revoca una sesión en BD (logout).
   */
  async logout(sessionId: number) {
    await this.prisma.sessions.update({
      where: { sessionsId: sessionId },
      data: { isRevoked: true },
    });
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
