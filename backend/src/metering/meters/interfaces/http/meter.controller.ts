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
import type { Response } from 'express';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { MeterService } from '../../application/meter.service';
import { CreateMeterDto } from '../dto/create-meter.dto';
import { UpdateMeterDto } from '../dto/update-meter.dto';
import { MeterResponseDto } from '../dto/meter-response.dto';
import { FilterMeterDto } from '../dto/filter-meter.dto';
import { ReplaceMeterDto } from '../dto/replace-meter.dto';
import { ReemplazoMedidorResponseDto } from '../dto/reemplazo-medidor-response.dto';
import { MeterHistoryResponseDto } from '../dto/meter-history-response.dto';
import { PaginatedMeterResponse } from '../types/paginated-meter-response.type';
import { EnumStateDto } from 'src/shared/enums/state-catalog';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import { ExportMeterDto } from '../dto/export-meter.dto';
import { CurrentUser } from 'src/identity/auth/interfaces/http/decorators/current-user.decorator';
import type { JwtPayload } from 'src/identity/auth/application/types/jwt.types';

@ApiTags('meters')
@ApiBearerAuth()
@Controller('meters')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

  /**
   * Obtener catálogo de estados de medidor
   */
  @ApiOperation({
    summary: 'Catálogo de estados de medidor',
    description: 'Retorna lista de estados disponibles para medidores',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de estados',
    type: [EnumStateDto],
  })
  @RequiredPermission('meters', 'read')
  @Get('status')
  findAllStates(): Promise<EnumStateDto[]> {
    return this.meterService.findAllStates();
  }

  /**
   * Crear un nuevo medidor
   * POST /meters
   */
  @ApiOperation({
    summary: 'Crear medidor',
    description: 'Registra un nuevo medidor en el sistema',
  })
  @ApiBody({ type: CreateMeterDto, description: 'Datos del medidor a crear' })
  @ApiResponse({
    status: 201,
    description: 'Medidor creado exitosamente',
    type: MeterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:create' })
  @ApiResponse({
    status: 409,
    description: 'Ya existe un medidor registrado con ese número de serie',
  })
  @RequiredPermission('meters', 'create')
  @Post()
  async create(@Body() createDto: CreateMeterDto): Promise<MeterResponseDto> {
    const meter = await this.meterService.create(createDto);
    return MeterResponseDto.fromEntity(meter);
  }

  /**
   * Listar todos los medidores
   * GET /meters
   */
  @ApiOperation({
    summary: 'Listar medidores',
    description: 'Retorna lista paginada de medidores con KPIs',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de medidores con KPIs',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('meters', 'read')
  @Get()
  async findAll(
    @Query() filterDto: FilterMeterDto,
  ): Promise<PaginatedMeterResponse> {
    return this.meterService.findAll(filterDto);
  }

  @ApiOperation({
    summary: 'Exportar inventario de medidores a CSV',
    description:
      'Descarga el inventario en CSV aplicando los mismos filtros de la pantalla (estado y búsqueda).',
  })
  @ApiResponse({
    status: 200,
    description: 'CSV generado',
    content: { 'text/csv': {} },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:read' })
  @RequiredPermission('meters', 'read')
  @Get('export/csv')
  async exportCsv(
    @Query() filters: ExportMeterDto,
    @Res() response: Response,
  ): Promise<void> {
    const stream = await this.meterService.exportCsv(filters);
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${buildExportFileName('csv')}"`,
    );
    stream.pipe(response);
  }

  @ApiOperation({
    summary: 'Exportar inventario de medidores a PDF',
    description:
      'Genera el reporte con cabecera oficial de JASRAPO, KPIs por estado y el detalle de medidores, aplicando los mismos filtros de la pantalla.',
  })
  @ApiResponse({
    status: 200,
    description: 'PDF generado',
    content: { 'application/pdf': {} },
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:read' })
  @RequiredPermission('meters', 'read')
  @Get('export/pdf')
  async exportPdf(
    @Query() filters: ExportMeterDto,
    @Res() response: Response,
  ): Promise<void> {
    const pdf = await this.meterService.exportPdf(filters);
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader(
      'Content-Disposition',
      `attachment; filename="${buildExportFileName('pdf')}"`,
    );
    response.setHeader('Content-Length', pdf.length);
    response.end(pdf);
  }

  @ApiOperation({
    summary: 'Historial del medidor',
    description:
      'Lista las asignaciones del medidor con indicador de reemplazo por registro',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del medidor',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Historial del medidor',
    type: [MeterHistoryResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'read')
  @Get(':id/history')
  async findHistory(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<MeterHistoryResponseDto[]> {
    const history = await this.meterService.getHistory(id);
    return history.map((item) => MeterHistoryResponseDto.fromEntity(item));
  }

  @ApiOperation({
    summary: 'Detalle de reemplazo de medidor',
    description: 'Retorna el detalle completo de un cambio de medidor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del reemplazo',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Reemplazo encontrado',
    type: ReemplazoMedidorResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Reemplazo no encontrado' })
  @RequiredPermission('meters', 'read')
  @Get('replacements/:id')
  async findReplacement(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<ReemplazoMedidorResponseDto> {
    const reemplazo = await this.meterService.findReplacement(id);
    return ReemplazoMedidorResponseDto.fromEntity(reemplazo);
  }

  /**
   * Obtener un medidor por ID
   * GET /meters/:id
   */
  @ApiOperation({
    summary: 'Obtener medidor por ID',
    description: 'Retorna los datos de un medidor específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del medidor',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Medidor encontrado',
    type: MeterResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<MeterResponseDto> {
    const meter = await this.meterService.findOne(id);
    return MeterResponseDto.fromEntity(meter);
  }

  /**
   * Actualizar un medidor
   * PATCH /meters/:id
   */
  @ApiOperation({
    summary: 'Actualizar medidor',
    description: 'Actualiza los datos de un medidor',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del medidor',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdateMeterDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Medidor actualizado',
    type: MeterResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:update' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseBigIntPipe) id: bigint,
    @Body() updateDto: UpdateMeterDto,
  ): Promise<MeterResponseDto> {
    const meter = await this.meterService.update(id, updateDto);
    return MeterResponseDto.fromEntity(meter);
  }

  /**
   * Eliminar un medidor (soft delete)
   * DELETE /meters/:id
   */
  @ApiOperation({
    summary: 'Eliminar medidor',
    description: 'Marca un medidor como eliminado (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'ID único del medidor',
    type: Number,
    example: 1,
  })
  @ApiResponse({ status: 200, description: 'Medidor eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:delete' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'delete')
  @Delete(':id')
  async delete(
    @Param('id', ParseBigIntPipe) id: bigint,
  ): Promise<{ message: string }> {
    return this.meterService.remove(id);
  }

  /**
   * Reemplazar / Cambiar medidor en contrato con resolución económica auditable
   * POST /meters/replace
   */
  @ApiOperation({
    summary: 'Reemplazar medidor en contrato',
    description:
      'Ejecuta el ciclo de reemplazo de medidor de forma transaccional, registrando telemetría y resolución económica.',
  })
  @ApiBody({ type: ReplaceMeterDto })
  @ApiResponse({
    status: 201,
    description: 'Reemplazo efectuado exitosamente',
    type: ReemplazoMedidorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o lectura inconsistente',
  })
  @ApiResponse({ status: 404, description: 'Contrato o medidor no encontrado' })
  @RequiredPermission('meters', 'update')
  @Post('replace')
  async replace(
    @Body() replaceDto: ReplaceMeterDto,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReemplazoMedidorResponseDto> {
    const result = await this.meterService.replaceMeter(replaceDto, user.sub);
    return ReemplazoMedidorResponseDto.fromEntity(result.reemplazo);
  }

  @ApiOperation({ summary: 'Aprobar tratamiento económico excepcional' })
  @ApiResponse({ status: 200, type: ReemplazoMedidorResponseDto })
  @RequiredPermission('meter-replacements', 'approve')
  @Post('replacements/:id/approve')
  async approveReplacement(
    @Param('id', ParseBigIntPipe) id: bigint,
    @CurrentUser() user: JwtPayload,
  ): Promise<ReemplazoMedidorResponseDto> {
    const result = await this.meterService.approveReplacement(id, user.sub);
    return ReemplazoMedidorResponseDto.fromEntity(result.reemplazo);
  }
}

function buildExportFileName(extension: 'csv' | 'pdf'): string {
  const today = new Date().toISOString().slice(0, 10);
  return `inventario-medidores-${today}.${extension}`;
}
