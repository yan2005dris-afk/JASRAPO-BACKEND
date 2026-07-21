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
} from '@nestjs/common';
import { ParseBigIntPipe } from 'src/infrastructure/common/pipes/parse-bigint.pipe';
import { MeterService } from '../../application/meter.service';
import { CreateMeterDto } from '../dto/create-meter.dto';
import { UpdateMeterDto } from '../dto/update-meter.dto';
import { MeterResponseDto } from '../dto/meter-response.dto';
import { FilterMeterDto } from '../dto/filter-meter.dto';
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
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { toMeterResponse } from '../../domain/types/metersMapper';

@ApiTags('meters')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
  @RequiredPermission('meters', 'create')
  @Post()
  async create(@Body() createDto: CreateMeterDto): Promise<MeterResponseDto> {
    return toMeterResponse(await this.meterService.create(createDto));
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
    return toMeterResponse(await this.meterService.findOne(id));
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
    return toMeterResponse(await this.meterService.update(id, updateDto));
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
}
