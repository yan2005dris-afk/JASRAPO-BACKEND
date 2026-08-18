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
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { RubrosService } from '../../application/rubros.service';
import { CreateRubroDto } from '../dto/create-rubro.dto';
import { UpdateRubroDto } from '../dto/update-rubro.dto';
import { RubroFilterDto } from '../dto/rubro-filter.dto';
import {
  RubroResponseDto,
  TarifaImpuestoResponseDto,
} from '../dto/rubro-response.dto';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { RequiredPermission } from 'src/infrastructure/common/decorators/require-permission.decorator';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@ApiTags('Rubros')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('rubros')
export class RubrosController {
  constructor(private readonly rubrosService: RubrosService) {}

  @ApiOperation({
    summary: 'Listar catálogo de tarifas de impuesto IVA activas',
  })
  @ApiResponse({
    status: 200,
    description: 'Listado de tarifas de impuesto',
    type: [TarifaImpuestoResponseDto],
  })
  @RequiredPermission('rubros', 'read')
  @Get('tarifas-impuesto')
  async getTarifasImpuesto(): Promise<TarifaImpuestoResponseDto[]> {
    return this.rubrosService.getTarifasImpuesto();
  }

  @ApiOperation({ summary: 'Crear un nuevo rubro' })
  @ApiResponse({
    status: 201,
    description: 'Rubro creado exitosamente',
    type: RubroResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  @ApiResponse({ status: 409, description: 'Código SRI duplicado' })
  @RequiredPermission('rubros', 'create')
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateRubroDto): Promise<RubroResponseDto> {
    return this.rubrosService.create(dto);
  }

  @ApiOperation({ summary: 'Listar rubros con paginación y filtros' })
  @ApiResponse({
    status: 200,
    description: 'Listado paginado de rubros',
  })
  @RequiredPermission('rubros', 'read')
  @Get()
  async findAll(
    @Query() filterDto: RubroFilterDto,
  ): Promise<PaginatedResult<RubroResponseDto>> {
    return this.rubrosService.findAll({
      page: filterDto.page,
      limit: filterDto.limit,
      nombre: filterDto.nombre,
      tipoRubro: filterDto.tipoRubro,
      tarifaImpuestoId: filterDto.tarifaImpuestoId,
      activo: typeof filterDto.activo === 'boolean' ? filterDto.activo : undefined,
      esAutomatico: typeof filterDto.esAutomatico === 'boolean' ? filterDto.esAutomatico : undefined,
    });
  }

  @ApiOperation({ summary: 'Obtener un rubro por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del rubro',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Rubro encontrado',
    type: RubroResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Rubro no encontrado' })
  @RequiredPermission('rubros', 'read')
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RubroResponseDto> {
    return this.rubrosService.findOne(id);
  }

  @ApiOperation({ summary: 'Actualizar un rubro por ID' })
  @ApiParam({
    name: 'id',
    description: 'ID del rubro a actualizar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Rubro actualizado exitosamente',
    type: RubroResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Rubro no encontrado' })
  @ApiResponse({ status: 409, description: 'Código SRI duplicado' })
  @RequiredPermission('rubros', 'update')
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRubroDto,
  ): Promise<RubroResponseDto> {
    return this.rubrosService.update(id, dto);
  }

  @ApiOperation({ summary: 'Eliminar un rubro (soft delete)' })
  @ApiParam({
    name: 'id',
    description: 'ID del rubro a eliminar',
    type: Number,
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Rubro eliminado exitosamente',
    type: RubroResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Rubro referenciado en facturación' })
  @ApiResponse({ status: 404, description: 'Rubro no encontrado' })
  @RequiredPermission('rubros', 'delete')
  @Delete(':id')
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<RubroResponseDto> {
    return this.rubrosService.remove(id);
  }
}
