import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from '../../application/auth.service';
import { LoginUserDto } from '../dto/login-user.dto';
import { LoginResponseDto, RefreshResponseDto } from '../dto/auth-response.dto';
import {
  UnlockAccountDto,
  UnlockAccountResponseDto,
} from '../dto/unlock-account.dto';
import type { AuthenticatedRequest } from 'src/infrastructure/common/types/auth-request.types';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { Public } from 'src/infrastructure/common/decorators/public.decorator';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiCookieAuth,
  ApiExtraModels,
} from '@nestjs/swagger';
import type { CookieOptions, Response } from 'express';
import type {
  LoginRequest,
  RefreshRequest,
} from './types/auth-controller.types';
import { REFRESH_TOKEN_MAX_AGE_MS } from 'src/infrastructure/config/app.constants';
import { CookieValue } from 'src/infrastructure/common/decorators/cookie-value.decorator';
import { RequiredStringPipe } from 'src/infrastructure/common/pipes/required-string.pipe';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@ApiTags('auth')
@ApiExtraModels(LoginResponseDto, RefreshResponseDto, UnlockAccountResponseDto)
@Controller('auth')
@UseGuards(ThrottlerGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Credenciales inválidas' })
  @ApiResponse({ status: 401, description: 'Autenticación fallida' })
  @Public()
  @ApiResponse({ status: 429, description: 'Demasiadas solicitudes' })
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('/login')
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Req() req: LoginRequest,
    @CookieValue('refreshToken') _existingRefreshTokenValue: unknown,
    @Res() res: Response,
  ) {
    const ip = req.ip ?? 'unknown';
    const userAgentHeader = req.headers['user-agent'];
    const userAgent =
      typeof userAgentHeader === 'string' ? userAgentHeader : 'unknown';
    const result = await this.authService.login(loginUserDto, ip, userAgent);

    const refreshCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    };
    res.cookie('refreshToken', result.refreshToken, refreshCookieOptions);
    res.json({
      accessToken: result.accessToken,
      sid: result.sid,
      sub: result.sub,
      email: result.email,
      nombre: result.nombre,
      rolId: result.rolId,
      nombreRol: result.nombreRol,
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
    type: RefreshResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token inválido o expirado',
  })
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(
    @Req() req: RefreshRequest,
    @CookieValue('refreshToken', new RequiredStringPipe('refreshToken'))
    refreshToken: string,
    @Res() res: Response,
  ) {
    const { sessionsId, usersId, sub } = req.user;
    const ip = req.ip ?? 'unknown';
    const userAgentHeader = req.headers['user-agent'];
    const userAgent =
      typeof userAgentHeader === 'string' ? userAgentHeader : 'unknown';

    const userId = typeof usersId !== 'undefined' ? usersId : sub;
    const tokens = await this.authService.refreshAccessToken(
      sessionsId,
      refreshToken,
      ip,
      userAgent,
      userId,
    );

    const refreshCookieOptions: CookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    };
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
    res.json({
      message: 'Token refrescado correctamente',
      accessToken: tokens.accessToken,
      sid: tokens.sid,
      sub: tokens.sub,
      email: tokens.email,
      nombre: tokens.nombre,
      rolId: tokens.rolId,
      nombreRol: tokens.nombreRol,
      avatar: tokens.avatar,
      createdAt: tokens.accessTokenInfo.iatDate,
      expiresAt: tokens.accessTokenInfo.expDate,
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
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('logout')
  async logout(@Req() req: RefreshRequest, @Res() res: Response) {
    const { sessionsId } = req.user;

    await this.authService.logout(sessionsId);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    res.json({ message: 'Sesión cerrada correctamente' });
  }

  /**
   * Desbloqueo administrativo de cuenta de usuario bloqueada por fuerza bruta (Issue #176).
   * Requiere permiso 'users:update' (administrador/superusuario).
   */
  @ApiOperation({
    summary: 'Desbloquear cuenta de usuario',
    description:
      'Desbloquea una cuenta de usuario que fue bloqueada por múltiples intentos fallidos de autenticación (fuerza bruta). Limpia los intentos fallidos, el bloqueo temporal y registra la auditoría.',
  })
  @ApiBody({ type: UnlockAccountDto })
  @ApiResponse({
    status: 200,
    description: 'Cuenta desbloqueada exitosamente',
    type: UnlockAccountResponseDto,
  })
  @ApiResponse({ status: 400, description: 'La cuenta no está bloqueada' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Prohibido - Sin permiso users:update',
  })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiBearerAuth()
  @RequiredPermission('users', 'update')
  @Post('admin/unlock-account')
  async unlockAccount(
    @Body() dto: UnlockAccountDto,
    @Req() req: AuthenticatedRequest,
  ): Promise<UnlockAccountResponseDto> {
    const adminUsuarioId = req.user?.usersId ?? 0;
    return this.authService.unlockAccount(dto, adminUsuarioId);
  }
}
