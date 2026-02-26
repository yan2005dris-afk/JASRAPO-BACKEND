import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/database/prisma.service';
import { UserService } from 'src/models/user/user.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EcuadorTimezoneUtil } from '../util/ecuador-timezone-backend.util';
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}
  async register({ email, password }: RegisterDto) {
    const user = await this.userService.user({ email: email });

    if (user) {
      throw new BadRequestException('El correo ya está registrado');
    }

    const newUser = await this.userService.createUser({
      email: email,
      password: await bcrypt.hash(password, 10),
    });
    if (newUser) {
      return 'El registro fue exitoso';
    } else {
      throw new BadRequestException('Error al registrar el usuario');
    }
  }

  async login(loginUserDto: LoginUserDto, ip?: string, userAgent?: string) {
    const users = await this.validateUser(loginUserDto);

    if (!users || users.deletedAt) {
      throw new UnauthorizedException('Usuario eliminado');
    }

    const session = await this.prisma.sessions.create({
      data: {
        usersId: users.usersId,
        refreshToken: '',
        ipAddress: ip ?? 'unknown',
        userAgent: userAgent ?? 'unknown',
        isRevoked: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
    });

    const { accessToken, refreshToken } = await this.generateJwtToken(
      users.usersId,
      session.sessionsId,
    );

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

    await this.prisma.sessions.update({
      where: { sessionsId: session.sessionsId },
      data: { refreshToken: hashedRefreshToken },
    });

    // Decodificar accessToken y refreshToken para obtener iat y exp
    const decodedAccess: any = this.jwtService.decode(accessToken);
    const decodedRefresh: any = this.jwtService.decode(refreshToken);
    return {
      sub: users.usersId,
      sid: session.sessionsId,
      accessToken,
      refreshToken,
      accessTokenInfo: {
        iat: decodedAccess?.iat,
        exp: decodedAccess?.exp,
        iatDate: decodedAccess?.iat
          ? EcuadorTimezoneUtil.formatAsEcuadorISO(
              new Date(decodedAccess.iat * 1000),
            )
          : null,
        expDate: decodedAccess?.exp
          ? EcuadorTimezoneUtil.formatAsEcuadorISO(
              new Date(decodedAccess.exp * 1000),
            )
          : null,
      },
      refreshTokenInfo: {
        iat: decodedRefresh?.iat,
        exp: decodedRefresh?.exp,
        iatDate: decodedRefresh?.iat
          ? EcuadorTimezoneUtil.formatAsEcuadorISO(
              new Date(decodedRefresh.iat * 1000),
            )
          : null,
        expDate: decodedRefresh?.exp
          ? EcuadorTimezoneUtil.formatAsEcuadorISO(
              new Date(decodedRefresh.exp * 1000),
            )
          : null,
      },
    };
  }

  /**
   * Generar el token jwt
   */
  private async generateJwtToken(userId: number, sessionId: number) {
    const payload = {
      sub: userId,
      sid: sessionId,
    };

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

  async refreshAccessToken(sessionId: number, refreshToken: string) {
    const session = await this.prisma.sessions.findUnique({
      where: { sessionsId: sessionId },
    });

    if (!session) {
      throw new UnauthorizedException('Session not found');
    }

    if (session.isRevoked) {
      throw new UnauthorizedException('Session revoked');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Session expired');
    }
    const isValid = await bcrypt.compare(refreshToken, session.refreshToken);

    if (!isValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.generateJwtToken(
      session.usersId,
      session.sessionsId,
    );

    const newHash = await bcrypt.hash(tokens.refreshToken, 10);

    await this.prisma.sessions.update({
      where: { sessionsId: session.sessionsId },
      data: { refreshToken: newHash },
    });
    return tokens;
  }

  async logout(sessionId: number) {
    await this.prisma.sessions.update({
      where: { sessionsId: sessionId },
      data: { isRevoked: true },
    });
  }

  async validateUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('Usuario eliminado');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password: _, ...safeUser } = user;

    return safeUser;
  }
}
