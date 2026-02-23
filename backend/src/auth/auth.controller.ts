import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import type { Request } from 'express';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  async login(@Body() loginUserDto: LoginUserDto, @Req() req: Request) {
    const ip = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.authService.login(loginUserDto, ip, userAgent);
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: any) {
    const user = req.user;
    // Aquí puedes llamar a tu AuthService para generar nuevos tokens
    return this.authService.refreshAccessToken(
      user.sessionsId,
      req.headers['authorization']?.replace('Bearer ', ''),
    );
  }
}
