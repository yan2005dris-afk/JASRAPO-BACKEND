import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MeterService } from './meter.service';
import { CreateMeterDto } from './dto/create-meter.dto';
import { UpdateMeterDto } from './dto/update-meter.dto';
import { InstallMeterDto } from './dto/install-meter.dto';
import { MeterResponseDto } from './dto/meter-response.dto';
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
import { EstadoMedidor } from 'src/generated/prisma/client';

@ApiTags('meters')
@ApiBearerAuth()
@Controller('meters')
export class MeterController {
  constructor(private readonly meterService: MeterService) {}

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
  @RequiredPermission('meters', 'create')
  @Post()
  async create(@Body() createDto: CreateMeterDto): Promise<MeterResponseDto> {
    return this.meterService.create(createDto);
  }

  /**
   * Listar todos los medidores
   * GET /meters
   */
  @ApiOperation({
    summary: 'Listar medidores',
    description: 'Retorna lista paginada de medidores',
  })
  @ApiQuery({
    name: 'skip',
    description: 'Número de registros a omitir',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiQuery({
    name: 'take',
    description: 'Número máximo de registros',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiQuery({
    name: 'estado',
    description: 'Filtrar por estado del medidor',
    required: false,
    enum: EstadoMedidor,
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de medidores',
    type: [MeterResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @RequiredPermission('meters', 'read')
  @Get()
  async findAll(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('estado') estado?: EstadoMedidor,
  ): Promise<MeterResponseDto[]> {
    return this.meterService.findAll({
      skip: skip ? +skip : undefined,
      take: take ? +take : undefined,
      where: estado ? { estado } : undefined,
    });
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
    type: String,
    example: '1',
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
  async findOne(@Param('id') id: string): Promise<MeterResponseDto> {
    return this.meterService.findOne(BigInt(id));
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
    type: String,
    example: '1',
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
    @Param('id') id: string,
    @Body() updateDto: UpdateMeterDto,
  ): Promise<MeterResponseDto> {
    return this.meterService.update(BigInt(id), updateDto);
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
    type: String,
    example: '1',
  })
  @ApiResponse({ status: 200, description: 'Medidor eliminado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso: meters:delete' })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'delete')
  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    return this.meterService.remove(BigInt(id));
  }

  /**
   * Instalar un medidor en un contrato
   * POST /meters/:id/install
   */
  @ApiOperation({
    summary: 'Instalar medidor',
    description: 'Asocia un medidor a un contrato',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del medidor',
    type: String,
    example: '1',
  })
  @ApiBody({
    schema: { example: { contratoId: '1' } },
    description: 'ID del contrato',
  })
  @ApiResponse({
    status: 200,
    description: 'Medidor instalado',
    type: MeterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos - el medidor debe estar en estado BODEGA',
  })
  @ApiResponse({ status: 404, description: 'Medidor o contrato no encontrado' })
  @ApiBody({
    type: InstallMeterDto,
    description: 'Datos para instalar el medidor',
  })
  @RequiredPermission('meters', 'update')
  @Post(':id/install')
  async install(
    @Param('id') id: string,
    @Body() installDto: InstallMeterDto,
  ): Promise<MeterResponseDto> {
    return this.meterService.install(BigInt(id), BigInt(installDto.contratoId));
  }

  /**
   * Reportar daño de un medidor
   * POST /meters/:id/report-defect
   */
  @ApiOperation({
    summary: 'Reportar daño',
    description: 'Marca un medidor como dañado',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del medidor',
    type: String,
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Daño reportado',
    type: MeterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El medidor debe estar en estado INSTALADO',
  })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'update')
  @Post(':id/report-defect')
  async reportDefect(@Param('id') id: string): Promise<MeterResponseDto> {
    return this.meterService.reportDefect(BigInt(id));
  }

  /**
   * Dar de baja un medidor
   * POST /meters/:id/decommission
   */
  @ApiOperation({
    summary: 'Dar de baja',
    description: 'Desactiva un medidor del sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del medidor',
    type: String,
    example: '1',
  })
  @ApiBody({
    schema: { example: { motivoBaja: 'Replacement' } },
    description: 'Motivo de la baja',
  })
  @ApiResponse({
    status: 200,
    description: 'Medidor dado de baja',
    type: MeterResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El medidor debe estar en estado DANADO',
  })
  @ApiResponse({ status: 404, description: 'Medidor no encontrado' })
  @RequiredPermission('meters', 'delete')
  @Post(':id/decommission')
  async decommission(
    @Param('id') id: string,
    @Body('motivoBaja') motivoBaja: string,
  ): Promise<MeterResponseDto> {
    return this.meterService.decommission(BigInt(id), motivoBaja);
  }
}
