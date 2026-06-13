import {
  Controller,
  Get,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiParam,
  ApiExtraModels,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import { PrefacturaService } from '../../application/prefactura.service';
import { FindAllPrefacturasDto } from '../dto/find-all-prefacturas.dto';
import { UpdatePrefacturaEstadoDto } from '../dto/update-prefactura-estado.dto';
import { PrefacturaResponseDto } from '../dto/prefactura-response.dto';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@ApiTags('Prefacturas')
@ApiBearerAuth()
@ApiExtraModels(PrefacturaResponseDto, PaginationMetaDto)
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('prefacturas')
export class PrefacturaController {
  constructor(private readonly prefacturaService: PrefacturaService) {}

  /**
   * GET /prefacturas/estados
   * Catálogo de estados de prefactura
   */
  @ApiOperation({
    summary: 'Listar estados de prefactura',
    description:
      'Retorna los estados disponibles para prefacturas con su orden',
  })
  @RequiredPermission('prefacturas', 'read')
  @Get('estados')
  async findAllEstados() {
    return this.prefacturaService.findAllEstados();
  }

  /**
   * GET /prefacturas
   * Lista prefacturas con paginación y filtros opcionales
   */
  @ApiOperation({
    summary: 'Listar prefacturas',
    description:
      'Retorna lista paginada de prefacturas. Filtros: loteId, periodoId, estado, contratoId, identificacion',
  })
  @ApiPaginatedResponse(PrefacturaResponseDto)
  @RequiredPermission('prefacturas', 'read')
  @Get()
  async findAll(
    @Query() query: FindAllPrefacturasDto,
  ): Promise<PaginatedResult<any>> {
    return this.prefacturaService.findAll(query.page, query.limit, {
      loteId: query.loteId,
      periodoId: query.periodoId,
      estado: query.estado,
      contratoId: query.contratoId,
      identificacion: query.identificacion,
    });
  }

  /**
   * GET /prefacturas/:id
   * Obtener detalle de una prefactura con sus rubros
   */
  @ApiOperation({
    summary: 'Obtener prefactura por ID',
    description:
      'Retorna el detalle completo de una prefactura incluyendo sus rubros (detalle), información del contrato, cliente, lote y periodo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la prefactura',
    type: Number,
    example: 1,
  })
  @RequiredPermission('prefacturas', 'read')
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.prefacturaService.findOne(id);
  }

  /**
   * PATCH /prefacturas/:id/estado
   * Cambiar estado de una prefactura
   */
  @ApiOperation({
    summary: 'Cambiar estado de prefactura',
    description:
      'Transiciona una prefactura según las reglas de estado. Ej: GENERADA -> EN_REVISION -> APROBADA/RECHAZADA. Requiere motivo si se rechaza.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID de la prefactura',
    type: Number,
    example: 1,
  })
  @RequiredPermission('prefacturas', 'update')
  @Patch(':id/estado')
  async updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePrefacturaEstadoDto,
    @CurrentUser() user: any,
  ) {
    return this.prefacturaService.updateEstado(
      id,
      dto.accion,
      user?.email ?? user?.sub?.toString(),
      dto.motivoRechazo,
    );
  }
}
