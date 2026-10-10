import { Controller, Patch, Param, Body } from '@nestjs/common';
import { CurrentUser } from '../../../../identity/auth/interfaces/http/decorators/current-user.decorator';
import type { JwtPayload } from '../../../../identity/auth/application/types/jwt.types';
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
import { LinkLecturaDto } from '../dto/link-lectura.dto';
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

  /**
   * Vincular lectura a una orden de trabajo
   */
  @ApiOperation({
    summary: 'Vincular lectura a orden de trabajo',
    description:
      'Vincula una lectura a la orden de trabajo y marca la orden como COMPLETADA con completadoEn = now()',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la orden de trabajo (bigint serializado como string)',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Lectura vinculada exitosamente',
    type: OrderWorkResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Orden o lectura no encontrada' })
  @RequiredPermission('routes', 'update')
  @Patch(':id/reading')
  async linkLectura(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
    @Body() dto: LinkLecturaDto,
  ): Promise<OrderWorkResponseDto> {
    const lecturaIdBigInt = BigInt(dto.lecturaId);
    const result = await this.ordenesTrabajoService.linkLectura(
      id,
      { lecturaId: lecturaIdBigInt },
      Number(user.sub),
    );
    return OrderWorkResponseDto.fromRow(result);
  }
}
