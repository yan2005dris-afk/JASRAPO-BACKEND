import { Controller, Patch, Param, Body } from '@nestjs/common';
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
import { UpdateOrdenEstadoDto } from '../dto/update-orden-estado.dto';
import { PaginationMetaDto } from 'src/shared/pagination/pagination-meta.dto';

@ApiTags('work-orders')
@ApiBearerAuth()
@ApiExtraModels(OrderWorkResponseDto, PaginationMetaDto)
@Controller('work-orders')
export class OrdenesTrabajoController {
  constructor(private readonly ordenesTrabajoService: OrdenesTrabajoService) {}

  /**
   * Actualizar estado de una orden de trabajo
   */
  @ApiOperation({
    summary: 'Actualizar estado de orden de trabajo',
    description:
      'Actualiza el estado de una orden de trabajo. Al completar/fallar se establece completadoEn. Al volver a Pendiente/EnProgreso se limpia completadoEn.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de trabajo (bigint serializado como string)',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Estado actualizado exitosamente',
    type: OrderWorkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden no encontrada' })
  @RequiredPermission('routes', 'update')
  @Patch(':id/state')
  async updateEstado(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrdenEstadoDto,
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
}
