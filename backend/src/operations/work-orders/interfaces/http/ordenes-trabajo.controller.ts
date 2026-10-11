import { Controller, Get, Patch, Param, Body } from '@nestjs/common';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';
import { ParseBigIntPipe } from 'src/common/pipes/parse-bigint.pipe';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { OrdenesTrabajoService } from '../../application/ordenes-trabajo.service';
import { OrderWorkResponseDto } from '../dto/orden-trabajo-response.dto';
import { UpdateOrdenTrabajoDto } from '../dto/update-orden-trabajo.dto';
import type { TipoActividad } from '../../domain/types/tipo-actividad.type';

@ApiTags('work-orders')
@ApiBearerAuth()
@ApiExtraModels(OrderWorkResponseDto)
@Controller('work-orders')
export class OrdenesTrabajoController {
  constructor(private readonly ordenesTrabajoService: OrdenesTrabajoService) {}

  /**
   * Actualizar una orden de trabajo.
   *
   * Reemplaza el legado `PATCH /work-orders/:id/state`. Mismo cuerpo
   * (`{ estado, resultadoObservacion }`) pero expone el recurso puro
   * REST sobre la orden.
   */
  @ApiOperation({
    summary: 'Actualizar orden de trabajo',
    description:
      'Actualiza el estado y, opcionalmente, la observación de una orden de trabajo. Al completar/fallar se establece completadoEn. Al volver a Pendiente/EnProgreso se limpia completadoEn.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de trabajo (bigint serializado como string)',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Orden actualizada exitosamente',
    type: OrderWorkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @RequiredPermission('work_orders', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrdenTrabajoDto,
  ): Promise<OrderWorkResponseDto> {
    const result = await this.ordenesTrabajoService.updateEstado(
      id,
      {
        estado: dto.estado,
        resultadoObservacion: dto.resultadoObservacion,
      },
      Number(user.sub),
    );
    return OrderWorkResponseDto.fromRow(result);
  }

  /**
   * Catálogo canónico de tipos de actividad.
   *
   * Reemplaza los legacy `GET /routes/activity-types` y
   * `GET /operator/activity-types`. Una sola fuente de verdad del
   * catálogo gestionada por el módulo de work orders.
   */
  @ApiOperation({
    summary: 'Obtener tipos de actividad',
    description:
      'Retorna la lista canónica de tipos de actividad disponibles para work orders, rutas y formularios administrativos.',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de tipos de actividad',
    type: 'array',
  })
  @RequiredPermission('work_orders', 'read')
  @Get('activity-types')
  async getActivityTypes(): Promise<TipoActividad[]> {
    return this.ordenesTrabajoService.getActivityTypes();
  }
}
