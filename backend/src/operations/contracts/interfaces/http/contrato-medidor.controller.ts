import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Res,
} from '@nestjs/common';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import type { Response } from 'express';
import { ContratoMedidorService } from '../../application/contrato-medidor.service';
import { CrearContratoMedidorDto } from '../dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from '../dto/update-contrato-medidor.dto';
import { buildPdfFileName } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import { FilterContractsDto } from '../dto/filter-contracts.dto';
import { AssignInstallationRouteDto } from '../dto/assign-installation-route.dto';
import { ContractResponseDto } from '../dto/contract-response.dto';
import { ServiceAreaResponseDto } from '../dto/service-area-response.dto';
import { RouteResponseDto } from '../../../routes/interfaces/dto/route-response.dto';
import {
  EnumStateDto,
  buildStateCatalog,
} from 'src/shared/enums/state-catalog';
import { EstadoServicioContrato } from 'src/shared/enums';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ApiPaginatedResponse } from 'src/infrastructure/common/decorators/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/infrastructure/common/dtos/pagination-meta.dto';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';

@ApiTags('contracts')
@ApiBearerAuth()
@ApiExtraModels(ContractResponseDto, PaginationMetaDto)
@Controller('contracts')
export class ContratoMedidorController {
  constructor(
    private readonly contratoMedidorService: ContratoMedidorService,
  ) {}

  @ApiOperation({
    summary: 'Crear contrato',
    description:
      'Crea un nuevo contrato con medidor en una transacción. La guía se genera automáticamente.',
  })
  @ApiBody({
    type: CrearContratoMedidorDto,
    description:
      'Datos del contrato (clienteId, medidorId, categoriaTarifaId, direccionSuministro y comunidadId)',
  })
  @ApiResponse({
    status: 201,
    description: 'Contrato creado',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:create' })
  @RequiredPermission('contracts', 'create')
  @Post()
  async crear(
    @Body() createDto: CrearContratoMedidorDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ContractResponseDto> {
    const actorUserId = user?.usersId ?? user?.sub;
    const result = await this.contratoMedidorService.crearContrato(
      createDto,
      actorUserId,
      user?.rol,
    );
    return ContractResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Listar contratos',
    description: 'Retorna lista de contratos con paginación y filtros',
  })
  @ApiPaginatedResponse(ContractResponseDto)
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('contracts', 'read')
  @Get()
  async buscarContratos(
    @Query() filters: FilterContractsDto,
  ): Promise<PaginatedResult<ContractResponseDto>> {
    const result = await this.contratoMedidorService.buscarContratos(filters);
    return {
      data: ContractResponseDto.fromEntityList(result.data),
      meta: result.meta,
    };
  }

  @ApiOperation({
    summary: 'Obtener área de servicio',
    description:
      'Retorna el perímetro (GeoJSON Polygon) dentro del cual deben ubicarse las coordenadas de los contratos',
  })
  @ApiResponse({
    status: 200,
    description: 'Área de servicio de la Junta',
    type: ServiceAreaResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('contracts', 'read')
  @Get('service-area')
  getServiceArea(): ServiceAreaResponseDto {
    return ServiceAreaResponseDto.fromDomain(
      this.contratoMedidorService.getServiceArea(),
    );
  }

  @ApiOperation({
    summary: 'Catálogo de estados de servicio del contrato',
    description: 'Retorna la lista de estados de contrato para filtrado y UI',
  })
  @ApiResponse({
    status: 200,
    description: 'Catálogo de estados de contrato',
    type: [EnumStateDto],
  })
  @RequiredPermission('contracts', 'read')
  @Get('states')
  getStates(): EnumStateDto[] {
    return buildStateCatalog(EstadoServicioContrato, {
      PENDIENTE_INSPECCION: 'Pendiente Inspección',
      RECHAZADO: 'Rechazado',
      PENDIENTE_PAGO: 'Pendiente Pago',
      PENDIENTE_INSTALACION: 'Pendiente Instalación',
      ACTIVO: 'Activo',
      SUSPENDIDO: 'Suspendido',
      RETIRADO: 'Retirado',
    });
  }

  @ApiOperation({
    summary: 'Obtener contrato',
    description: 'Retorna un contrato por ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato encontrado',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'read')
  @Get(':id')
  async buscarContrato(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ContractResponseDto> {
    const result = await this.contratoMedidorService.buscarContrato(id);
    return ContractResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Actualizar contrato',
    description:
      'Actualiza estados separados del contrato, direccionSuministro o sectorId. Si se envía medidorId, reemplaza el medidor en una transacción.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: Number,
    example: 1,
  })
  @ApiBody({
    type: ActualizarContratoMedidorDto,
    description:
      'Campos a actualizar (estadoServicio, estadoCobranza, direccionSuministro, sectorId, medidorId opcional para reemplazo)',
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato actualizado',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:update' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'update')
  @Patch(':id')
  async actualizarContrato(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateDto: ActualizarContratoMedidorDto,
  ): Promise<ContractResponseDto> {
    const result = await this.contratoMedidorService.actualizar(id, updateDto);
    return ContractResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Finalizar vínculo',
    description:
      'Finaliza el vínculo activo entre contrato y medidor. Busca por ID de contrato.',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Vínculo finalizado',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'update')
  @Post(':id/finalize')
  async finalizarVinculo(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ContractResponseDto> {
    const result = await this.contratoMedidorService.finalizarVinculo(id);
    return ContractResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Eliminar contrato',
    description: 'Elimina un contrato (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Contrato eliminado',
    type: ContractResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:delete' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'delete')
  @Delete(':id')
  async eliminarContrato(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ContractResponseDto> {
    const result = await this.contratoMedidorService.eliminar(id);
    return ContractResponseDto.fromEntity(result);
  }

  @ApiOperation({
    summary: 'Asignar contrato a ruta de instalación',
    description:
      'Asigna la orden de instalaci\u00f3n pendiente del contrato a una ruta INSTALACION. Sin routeId reutiliza su ruta actual. La operaci\u00f3n es transaccional y no duplica la orden',
  })
  @ApiResponse({
    status: 200,
    description: 'Ruta creada o encontrada',
    type: RouteResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Contrato no esta en PENDIENTE_INSTALACION o ruta invalida',
  })
  @ApiResponse({ status: 404, description: 'Contrato o ruta no encontrado' })
  @RequiredPermission('contracts', 'update')
  @Post(':id/assign-installation-route')
  async assignInstallationRoute(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() dto: AssignInstallationRouteDto,
  ): Promise<RouteResponseDto> {
    const route = await this.contratoMedidorService.assignInstallationRoute(
      id,
      dto,
    );
    return RouteResponseDto.fromEntity(route);
  }

  /**
   * GET /contracts/:id/pdf/connection-request
   * Generate connection request PDF (Solicitud para Conexión de Agua Potable)
   */
  @ApiOperation({ summary: 'Generate connection request PDF' })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'PDF generado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'read')
  @Get(':id/pdf/connection-request')
  async connectionRequestPdf(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Res() res: Response,
  ) {
    const buffer =
      await this.contratoMedidorService.generateConnectionRequestPdf(id);
    const filename = buildPdfFileName('solicitud-conexion');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }

  /**
   * GET /contracts/:id/pdf/responsibility-agreement
   * Generate responsibility agreement PDF (Acta de Responsabilidad)
   */
  @ApiOperation({ summary: 'Generate responsibility agreement PDF' })
  @ApiParam({
    name: 'id',
    description: 'ID del contrato',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'PDF generado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'read')
  @Get(':id/pdf/responsibility-agreement')
  async responsibilityAgreementPdf(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Res() res: Response,
  ) {
    const buffer =
      await this.contratoMedidorService.generateResponsibilityAgreementPdf(id);
    const filename = buildPdfFileName('acta-responsabilidad');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
