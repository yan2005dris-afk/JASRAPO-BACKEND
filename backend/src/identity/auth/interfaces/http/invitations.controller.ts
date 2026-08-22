import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from 'src/infrastructure/common/decorators/public.decorator';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { AcceptInvitationUseCase } from '../../application/use-cases/accept-invitation.use-case';
import { InvitationService } from '../../application/services/invitation.service';
import { InvitationMetricsService } from '../../application/services/invitation-metrics.service';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { InvitationPreviewDto } from '../dto/invitation-preview.dto';

@ApiTags('invitations')
@Controller('auth/invitations')
@UseGuards(ThrottlerGuard)
export class InvitationsController {
  constructor(
    private readonly acceptInvitationUseCase: AcceptInvitationUseCase,
    private readonly invitationService: InvitationService,
    private readonly metricsService: InvitationMetricsService,
  ) {}

  @ApiOperation({
    summary: 'Vista previa de invitación',
    description:
      'Obtiene información de la invitación sin consumirla. Permite al usuario ver detalles antes de aceptar.',
  })
  @ApiParam({
    name: 'token',
    description: 'Token de invitación',
    example: 'abc123...',
  })
  @ApiResponse({
    status: 200,
    description: 'Información de la invitación',
    type: InvitationPreviewDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Invitación no encontrada',
  })
  @ApiResponse({
    status: 410,
    description: 'Invitación expirada o ya utilizada',
  })
  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Get(':token/preview')
  async preview(@Param('token') token: string): Promise<InvitationPreviewDto> {
    const invitation = await this.invitationService.previewInvitation(token);

    return {
      email: invitation.usuario?.email || '',
      nombres: invitation.usuario?.nombres || '',
      apellidos: invitation.usuario?.apellidos || '',
      expiresAt: invitation.expiresAt,
      isAccepted: invitation.acceptedAt !== null,
    };
  }

  @ApiOperation({
    summary: 'Aceptar invitación',
    description:
      'Acepta la invitación y establece la contraseña del usuario. El token se invalida después de ser usado.',
  })
  @ApiBody({
    type: AcceptInvitationDto,
    description: 'Token e información de contraseña',
  })
  @ApiResponse({
    status: 200,
    description: 'Invitación aceptada correctamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Token o contraseña inválida',
  })
  @ApiResponse({
    status: 404,
    description: 'Invitación no encontrada',
  })
  @ApiResponse({
    status: 410,
    description: 'Invitación expirada o ya utilizada',
  })
  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('accept')
  async accept(
    @Body() acceptInvitationDto: AcceptInvitationDto,
  ): Promise<{ message: string; usuarioId: number; email: string }> {
    const usuario = await this.acceptInvitationUseCase.execute(
      acceptInvitationDto,
    );

    return {
      message: 'Invitación aceptada correctamente',
      usuarioId: usuario.usuarioId,
      email: usuario.email,
    };
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Obtener métricas de invitaciones',
    description:
      'Retorna estadísticas sobre el proceso de invitaciones: creadas, aceptadas, pendientes, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas de invitaciones',
  })
  @RequiredPermission('users', 'read')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Get('metrics')
  async getMetrics() {
    return await this.metricsService.getMetrics();
  }
}
