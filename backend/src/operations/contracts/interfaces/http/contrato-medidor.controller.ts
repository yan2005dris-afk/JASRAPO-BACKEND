import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Res,
} from '@nestjs/common';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import type { Response } from 'express';
import { ContratoMedidorService } from '../../application/contrato-medidor.service';
import { CrearContratoMedidorDto } from '../dto/create-contrato-medidor.dto';
import { ActualizarContratoMedidorDto } from '../dto/update-contrato-medidor.dto';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';
import { buildPdfFileName } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { EnumStateDto } from 'src/shared/enums/state-catalog';

@ApiTags('contracts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('contracts')
export class ContratoMedidorController {
  constructor(
    private readonly contratoMedidorService: ContratoMedidorService,
  ) {}

  @ApiOperation({
    summary: 'Catálogo de estados de contrato',
    description: 'Retorna la lista de estados disponibles para contratos',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados de contrato',
    type: [EnumStateDto],
  })
  @RequiredPermission('contracts', 'read')
  @Get('states')
  getContractStates(): EnumStateDto[] {
    return this.contratoMedidorService.getContractStatesCatalog();
  }

  @ApiOperation({
    summary: 'Crear contrato',
    description:
      'Crea un nuevo contrato con medidor en una transacción. Requiere clienteId, categoriaTarifaId, medidorId, numeroGuia, direccionSuministro, comunidadId obligatorios.',
  })
  @ApiBody({
    type: CrearContratoMedidorDto,
    description:
      'Datos del contrato (clienteId, medidorId, categoriaTarifaId, numeroGuia, direccionSuministro, comunidadId obligatorios)',
  })
  @ApiResponse({ status: 201, description: 'Contrato creado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:create' })
  @RequiredPermission('contracts', 'create')
  @Post()
  crear(@Body() createDto: CrearContratoMedidorDto) {
    return this.contratoMedidorService.crearContrato(createDto);
  }

  @ApiOperation({
    summary: 'Listar contratos',
    description: 'Retorna lista de contratos con paginación',
  })
  @ApiQuery({
    name: 'contratoId',
    description: 'Filtrar por ID de contrato',
    required: false,
    type: String,
  })
  @ApiQuery({
    name: 'medidorId',
    description: 'Filtrar por ID de medidor',
    required: false,
    type: String,
  })
  @ApiResponse({ status: 200, description: 'Lista de contratos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('contracts', 'read')
  @Get()
  buscarContratos(
    @Query() paginationDto: PaginationDto,
    @Query('contratoId') contratoId?: string,
    @Query('medidorId') medidorId?: string,
  ) {
    const where: any = {};
    if (contratoId) where.contratoId = BigInt(contratoId);
    if (medidorId) where.medidorId = BigInt(medidorId);
    return this.contratoMedidorService.buscarContratos(
      paginationDto.page,
      paginationDto.limit,
      where,
    );
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
  @ApiResponse({ status: 200, description: 'Contrato encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'read')
  @Get(':id')
  buscarContrato(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.contratoMedidorService.buscarContrato(id);
  }

  @ApiOperation({
    summary: 'Actualizar contrato',
    description:
      'Actualiza campos del contrato (estado, direccionSuministro, sectorId). Si se envía medidorId, reemplaza el medidor en una transacción.',
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
      'Campos a actualizar (estado, direccionSuministro, sectorId, medidorId opcional para reemplazo)',
  })
  @ApiResponse({ status: 200, description: 'Contrato actualizado' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:update' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'update')
  @Patch(':id')
  actualizarContrato(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateDto: ActualizarContratoMedidorDto,
  ) {
    return this.contratoMedidorService.actualizar(id, updateDto);
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
  @ApiResponse({ status: 200, description: 'Vínculo finalizado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'update')
  @Post(':id/finalize')
  finalizarVinculo(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.contratoMedidorService.finalizarVinculo(id);
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
  @ApiResponse({ status: 200, description: 'Contrato eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso contracts:delete' })
  @ApiResponse({ status: 404, description: 'Contrato no encontrado' })
  @RequiredPermission('contracts', 'delete')
  @Delete(':id')
  eliminarContrato(@Param('id', ParseBigIntPipe) id: bigint) {
    return this.contratoMedidorService.eliminar(id);
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
      await this.contratoMedidorService.generateConnectionRequestPdf(
        BigInt(id),
      );
    const filename = buildPdfFileName('solicitud-conexion', 'General');
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
      await this.contratoMedidorService.generateResponsibilityAgreementPdf(
        BigInt(id),
      );
    const filename = buildPdfFileName('acta-responsabilidad', 'General');
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${filename}"`,
      'Content-Length': buffer.length,
    });
    res.end(buffer);
  }
}
