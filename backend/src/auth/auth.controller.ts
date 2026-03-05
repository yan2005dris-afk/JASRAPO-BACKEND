import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from './guards/permissions.guard';
import { RequiredPermission } from './decorators/require-permission.decorator';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiredPermission('users', 'create')
  @ApiOperation({ summary: 'Registrar un nuevo usuario', description: 'Crea un nuevo usuario en el sistema. Requiere permisos de creación de usuarios.' })
  @ApiResponse({ status: 201, description: 'Usuario creado exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado - Token inválido o expirado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permisos suficientes' })
  @ApiResponse({ status: 409, description: 'Conflicto - El usuario ya existe' })
  @ApiBody({ type: RegisterDto })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @ApiOperation({ 
    summary: 'Iniciar sesión', 
    description: 'Autentica al usuario y retorna el token de acceso JWT. El refresh token se almacena en una cookie segura.'
  })
  @ApiResponse({ status: 200, description: 'Login exitoso - Retorna accessToken y datos del usuario' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'Credenciales incorrectas' })
  @ApiBody({ type: LoginUserDto })
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

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ 
    summary: 'Refrescar token de acceso', 
    description: 'Utiliza el refresh token de la cookie para obtener un nuevo access token.'
  })
  @ApiResponse({ status: 200, description: 'Token refrescado exitosamente' })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
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

  @ApiBearerAuth('JWT-auth')
  @UseGuards(JwtRefreshGuard)
  @ApiOperation({ 
    summary: 'Cerrar sesión', 
    description: 'Invalida el refresh token y cierra la sesión del usuario.'
  })
  @ApiResponse({ status: 200, description: 'Sesión cerrada exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
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

