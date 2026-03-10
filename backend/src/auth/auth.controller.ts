import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { RequiredPermission } from '../common/decorators/require-permission.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
} from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Registrar un nuevo usuario en el sistema.
   * Requiere autenticación JWT y permiso 'users:create'.
   */
  @ApiOperation({
    summary: 'Registrar nuevo usuario',
    description:
      'Crea un nuevo usuario en el sistema. Requiere permiso users:create.',
  })
  @ApiBody({ type: RegisterDto, description: 'Datos del usuario a registrar' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    schema: {
      example: {
        usersId: 1,
        email: 'nuevo@jasrapo.com',
        createdAt: '2024-01-15T10:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Prohibido - Sin permiso users:create' })
  @ApiResponse({ status: 409, description: 'El correo electrónico ya existe' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @RequiredPermission('users', 'create')
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  /**
   * Iniciar sesión en el sistema.
   * Retorna un accessToken JWT y guarda un refreshToken en cookie.
   */
  @ApiOperation({
    summary: 'Iniciar sesión',
    description:
      'Autentica al usuario y retorna un token de acceso JWT. El refreshToken se almacena en una cookie httpOnly.',
  })
  @ApiBody({
    type: LoginUserDto,
    description: 'Credenciales del usuario (email y contraseña)',
  })
  @ApiResponse({
    status: 200,
    description: 'Login exitoso',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        sid: 'session-id-123',
        sub: 1,
        email: 'admin@jasrapo.com',
        name: 'Admin',
        roleId: 1,
        roleName: 'Administrador',
        avatar: 'https://example.com/avatar.png',
        createdAt: '2024-01-15T10:30:00Z',
        expiresAt: '2024-01-15T11:30:00Z',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 401, description: 'Autenticación fallida' })
  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: any,
    @Res() res: any,
  ) {
    const ip = req.ip as string;
    const userAgent = req.headers['user-agent'] as string;
    const existingRefreshToken = req.cookies?.refreshToken as
      | string
      | undefined;

    const result = await this.authService.login(
      loginUserDto,
      ip,
      userAgent,
      existingRefreshToken,
    );

    // Solo guardar refreshToken en cookie, accessToken va en el payload
    const refreshCookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 días para refreshToken
    };
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    res.json({
      accessToken: result.accessToken,
      sid: result.sid,
      sub: result.sub,
      email: result.email,
      name: result.name,
      roleId: result.roleId,
      roleName: result.roleName,
      avatar: result.avatar,
      createdAt: result.accessTokenInfo.iatDate,
      expiresAt: result.accessTokenInfo.expDate,
    });
  }

  /**
   * Refrescar el token de acceso.
   * Usa el refreshToken de la cookie para generar un nuevo accessToken.
   */
  @ApiOperation({
    summary: 'Refrescar token de acceso',
    description:
      'Genera un nuevo token de acceso usando el refreshToken almacenado en cookies.',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Token refrescado exitosamente',
    schema: {
      example: {
        message: 'Token refrescado correctamente',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Refresh token inválido o expirado' })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Req() req: any, @Res() res: any) {
    const { sessionsId, usersId, sub } = req.user;
    const refreshToken = req.cookies?.refreshToken as string;
    const ip = (req.ip as string) ?? 'unknown';
    const userAgent = (req.headers['user-agent'] as string) ?? 'unknown';

    // Usa usersId si existe, si no sub (por compatibilidad)
    const userId = typeof usersId !== 'undefined' ? usersId : sub;
    const tokens = await this.authService.refreshAccessToken(
      sessionsId,
      refreshToken,
      ip,
      userAgent,
      userId,
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

  /**
   * Cerrar sesión.
   * Elimina la sesión actual y limpia la cookie de refreshToken.
   */
  @ApiOperation({
    summary: 'Cerrar sesión',
    description:
      'Cierra la sesión actual del usuario y elimina el refreshToken de la cookie.',
  })
  @ApiCookieAuth('refreshToken')
  @ApiResponse({
    status: 200,
    description: 'Sesión cerrada exitosamente',
    schema: {
      example: {
        message: 'Sesión cerrada correctamente',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Req() req: any, @Res() res: any) {
    const { sessionsId, sub: userId } = req.user;

    // Marcar la sesión como revocada en BD
    await this.authService.logout(sessionsId, userId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Sesión cerrada correctamente' });
  }
}

