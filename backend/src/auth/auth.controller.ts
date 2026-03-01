import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import type { Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: Request,
    @Res() res: any,
  ) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    const result = await this.authService.login(loginUserDto, ip, userAgent);
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
      "role": result.roles,
      "avatar": result.avatar,
      "createdAt": result.accessTokenInfo.iatDate,
      "expiresAt": result.accessTokenInfo.expDate
    });
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: any, @Res() res: any) {
    const user = req.user;
    // Obtener refreshToken del header Authorization
    const refreshToken = req.headers['authorization']?.replace('Bearer ', '');
    const tokens = await this.authService.refreshAccessToken(
      user.sessionsId,
      refreshToken,
    );
    // Solo guardar refreshToken en cookie, accessToken va en el payload
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
  @Post('logout')
  async logout(@Res() res: any) {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Sesión cerrada correctamente' });
  }
}
