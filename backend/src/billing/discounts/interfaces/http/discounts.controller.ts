import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { DiscountsService } from '../../application/discounts.service';
import { CreateDiscountDto } from '../dto/create-discount.dto';
import { UpdateDiscountDto } from '../dto/update-discount.dto';
import { DiscountFilterDto } from '../dto/discount-filter.dto';
import { DiscountResponseDto } from '../dto/discount-response.dto';
import { ApplyDiscountToPreinvoiceDto } from '../dto/apply-discount-to-preinvoice.dto';
import { RequiredPermission } from '../../../../infrastructure/common/decorators/require-permission.decorator';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

@ApiTags('Descuentos')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiredPermission('discounts', 'create')
  @ApiOperation({ summary: 'Crear un nuevo descuento' })
  @ApiResponse({
    status: 201,
    description: 'Descuento creado exitosamente',
    type: DiscountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permiso discounts:create',
  })
  async create(@Body() dto: CreateDiscountDto): Promise<DiscountResponseDto> {
    const entity = await this.discountsService.create(dto);
    return DiscountResponseDto.fromEntity(entity);
  }

  @Get()
  @RequiredPermission('discounts', 'read')
  @ApiOperation({ summary: 'Listar descuentos con filtros' })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de descuentos activos',
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:read' })
  async findAll(
    @Query() filter: DiscountFilterDto,
  ): Promise<PaginatedResult<DiscountResponseDto>> {
    const result = await this.discountsService.findAll(filter);
    return {
      data: DiscountResponseDto.fromEntityList(result.data),
      meta: result.meta,
    };
  }

  @Get(':id')
  @RequiredPermission('discounts', 'read')
  @ApiOperation({ summary: 'Obtener un descuento por ID' })
  @ApiResponse({
    status: 200,
    description: 'Descuento encontrado',
    type: DiscountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:read' })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DiscountResponseDto> {
    const entity = await this.discountsService.findOne(id);
    return DiscountResponseDto.fromEntity(entity);
  }

  @Patch(':id')
  @RequiredPermission('discounts', 'update')
  @ApiOperation({ summary: 'Actualizar un descuento' })
  @ApiResponse({
    status: 200,
    description: 'Descuento actualizado',
    type: DiscountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:update' })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ): Promise<DiscountResponseDto> {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar',
      );
    }
    const entity = await this.discountsService.update(id, dto);
    return DiscountResponseDto.fromEntity(entity);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('discounts', 'delete')
  @ApiOperation({ summary: 'Desactivar un descuento (soft-delete)' })
  @ApiResponse({
    status: 200,
    description: 'Descuento desactivado',
    type: DiscountResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:delete' })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<DiscountResponseDto> {
    const entity = await this.discountsService.remove(id);
    return DiscountResponseDto.fromEntity(entity);
  }

  @Post('apply-to-preinvoice/:prefacturaId')
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('discounts', 'apply')
  @ApiOperation({ summary: 'Aplicar descuento manual a una prefactura' })
  @ApiResponse({ status: 200, description: 'Descuento aplicado correctamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:apply' })
  @ApiResponse({
    status: 404,
    description: 'Prefactura o descuento no encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'No se puede aplicar descuento (estado inválido o monto cero)',
  })
  applyToPreinvoice(
    @Param('prefacturaId', ParseIntPipe) prefacturaId: number,
    @Body() dto: ApplyDiscountToPreinvoiceDto,
  ) {
    return this.discountsService.applyToPreinvoice(prefacturaId, dto);
  }
}
