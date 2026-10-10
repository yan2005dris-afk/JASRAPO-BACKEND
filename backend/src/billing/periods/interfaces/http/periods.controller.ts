import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { PeriodsService } from '../../application/periods.service';
import { CreatePeriodDto } from '../dto/create-period.dto';
import { UpdatePeriodDto } from '../dto/update-period.dto';
import { PeriodFilterDto } from '../dto/period-filter.dto';
import { PeriodResponseDto } from '../dto/period-response.dto';
import { GenerateAnnualPeriodsDto } from '../dto/generate-annual-periods.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
  ApiExtraModels,
} from '@nestjs/swagger';
import { RequiredPermission } from 'src/common/decorators/require-permission.decorator';
import { ApiPaginatedResponse } from 'src/shared/pagination/api-paginated-response.decorator';
import { PaginationMetaDto } from 'src/shared/pagination/pagination-meta.dto';
import type { PaginatedResult } from 'src/shared/pagination/pagination.types';

@ApiTags('periods')
@ApiBearerAuth()
@ApiExtraModels(PeriodResponseDto, PaginationMetaDto)
@Controller('periods')
export class PeriodsController {
  constructor(private readonly periodsService: PeriodsService) {}

  @ApiOperation({
    summary: 'Crear periodo',
    description: 'Crea un nuevo periodo de facturación',
  })
  @ApiBody({ type: CreatePeriodDto, description: 'Datos del periodo' })
  @ApiResponse({
    status: 201,
    description: 'Periodo creado exitosamente',
    type: PeriodResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o inconsistencia en fechas',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso periodos:create' })
  @ApiResponse({ status: 409, description: 'Periodo con ese nombre ya existe' })
  @RequiredPermission('periodos', 'create')
  @Post()
  async create(
    @Body() createPeriodDto: CreatePeriodDto,
  ): Promise<PeriodResponseDto> {
    const result = await this.periodsService.create(createPeriodDto);
    return PeriodResponseDto.fromRow(result);
  }

  @ApiOperation({
    summary: 'Generar ejercicio anual completo',
    description:
      'Genera automáticamente los 12 períodos mensuales para el año especificado',
  })
  @ApiBody({
    type: GenerateAnnualPeriodsDto,
    description: 'Configuración del año',
  })
  @ApiResponse({
    status: 201,
    description: 'Períodos anuales generados exitosamente',
    type: [PeriodResponseDto],
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso periodos:create' })
  @RequiredPermission('periodos', 'create')
  @Post('generate-year')
  async generateAnnualPeriods(
    @Body() dto: GenerateAnnualPeriodsDto,
  ): Promise<PeriodResponseDto[]> {
    const results = await this.periodsService.generateAnnualPeriods(dto);
    return PeriodResponseDto.fromRowList(results);
  }

  @ApiOperation({
    summary: 'Listar periodos',
    description: 'Retorna listado paginado de periodos con filtros opcionales',
  })
  @ApiPaginatedResponse(PeriodResponseDto)
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso periodos:read' })
  @RequiredPermission('periodos', 'read')
  @Get()
  async findAll(
    @Query() filters: PeriodFilterDto,
  ): Promise<PaginatedResult<PeriodResponseDto>> {
    const result = await this.periodsService.findAll(filters, {
      page: filters.page,
      limit: filters.limit,
    });
    return {
      data: PeriodResponseDto.fromRowList(result.data),
      meta: result.meta,
    };
  }

  @ApiOperation({
    summary: 'Obtener periodo por ID',
    description: 'Retorna los detalles de un periodo específico',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Periodo encontrado',
    type: PeriodResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso periodos:read' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  @RequiredPermission('periodos', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PeriodResponseDto> {
    const result = await this.periodsService.findOne(id);
    return PeriodResponseDto.fromRow(result);
  }

  @ApiOperation({
    summary: 'Actualizar periodo',
    description: 'Actualiza datos o estado de un periodo',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    type: Number,
    example: 1,
  })
  @ApiBody({ type: UpdatePeriodDto, description: 'Datos a actualizar' })
  @ApiResponse({
    status: 200,
    description: 'Periodo actualizado exitosamente',
    type: PeriodResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o inconsistencia en fechas',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso periodos:update' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  @ApiResponse({ status: 409, description: 'Nombre de periodo en conflicto' })
  @RequiredPermission('periodos', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePeriodDto: UpdatePeriodDto,
  ): Promise<PeriodResponseDto> {
    const result = await this.periodsService.update(id, updatePeriodDto);
    return PeriodResponseDto.fromRow(result);
  }

  @ApiOperation({
    summary: 'Eliminar periodo',
    description:
      'Elimina un periodo si no posee lecturas, prefacturas, lotes o rutas asociadas',
  })
  @ApiParam({
    name: 'id',
    description: 'ID del periodo',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Periodo eliminado exitosamente',
    type: PeriodResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Periodo tiene dependencias asociadas',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso periodos:delete' })
  @ApiResponse({ status: 404, description: 'Periodo no encontrado' })
  @RequiredPermission('periodos', 'delete')
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PeriodResponseDto> {
    const result = await this.periodsService.delete(id);
    return PeriodResponseDto.fromRow(result);
  }
}
