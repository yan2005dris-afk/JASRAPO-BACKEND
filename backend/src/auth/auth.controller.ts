import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequiredPermission } from './decorators/require-permission.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiredPermission('users', 'create')
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  /**
   * Metodo para iniciar sesion
   * @param loginUserDto dto que contiene email y contraseña
   * @param req objeto que contiene la peticion viene informacion del navegador y la ip del cliente
   * @param res objeto que contiene la respuesta
   */
  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    const ip = req.ip as string;
    const userAgent = req.headers['user-agent'] as string;
    const existingRefreshToken = req.cookies?.refreshToken as string | undefined;

    const result = await this.authService.login(loginUserDto, ip, userAgent, existingRefreshToken);

    // Solo guardar refreshToken en cookie, accessToken va en el payload
    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días para refreshToken
    };
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    res.json({
      "accessToken": result.accessToken,
      "sid": result.sid,
      "sub": result.sub,
      "email": result.email,
      "name": result.name,
      "roleId": result.roleId,
      "roleName": result.roleName,
      "avatar": result.avatar,
      "createdAt": result.accessTokenInfo.iatDate,
      "expiresAt": result.accessTokenInfo.expDate
    });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: any, @Res() res: any) {
    const { sessionsId } = req.user;
    const refreshToken = req.cookies?.refreshToken as string;
    const ip = req.ip as string ?? 'unknown';
    const userAgent = req.headers['user-agent'] as string ?? 'unknown';

    const tokens = await this.authService.refreshAccessToken(
      sessionsId,
      refreshToken,
      ip,
      userAgent,
      req.user?.email ?? '',
    );

    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    };
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    res.json({
      message: 'Token refrescado correctamente',
      accessToken: tokens.accessToken,
    });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res() res: any) {
    const { sessionsId } = req.user;

    // Marcar la sesión como revocada en BD
    await this.authService.logout(sessionsId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Sesión cerrada correctamente' });
  }
}
