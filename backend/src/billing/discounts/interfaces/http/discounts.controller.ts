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
import { ApplyDiscountToPreinvoiceDto } from '../dto/apply-discount-to-preinvoice.dto';
import { RequiredPermission } from '../../../../infrastructure/common/decorators/require-permission.decorator';

@ApiTags('Descuentos')
@ApiBearerAuth()
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequiredPermission('discounts', 'create')
  @ApiOperation({ summary: 'Crear un nuevo descuento' })
  @ApiResponse({ status: 201, description: 'Descuento creado exitosamente' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({
    status: 403,
    description: 'Sin permiso discounts:create',
  })
  create(@Body() dto: CreateDiscountDto) {
    return this.discountsService.create(dto);
  }

  @Get()
  @RequiredPermission('discounts', 'read')
  @ApiOperation({ summary: 'Listar descuentos con filtros' })
  @ApiResponse({ status: 200, description: 'Lista de descuentos activos' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:read' })
  findAll(@Query() filter: DiscountFilterDto) {
    return this.discountsService.findAll(filter);
  }

  @Get(':id')
  @RequiredPermission('discounts', 'read')
  @ApiOperation({ summary: 'Obtener un descuento por ID' })
  @ApiResponse({ status: 200, description: 'Descuento encontrado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:read' })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  @RequiredPermission('discounts', 'update')
  @ApiOperation({ summary: 'Actualizar un descuento' })
  @ApiResponse({ status: 200, description: 'Descuento actualizado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:update' })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateDiscountDto,
  ) {
    if (Object.keys(dto).length === 0) {
      throw new BadRequestException(
        'Debe enviar al menos un campo para actualizar',
      );
    }
    return this.discountsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @RequiredPermission('discounts', 'delete')
  @ApiOperation({ summary: 'Desactivar un descuento (soft-delete)' })
  @ApiResponse({ status: 200, description: 'Descuento desactivado' })
  @ApiResponse({ status: 401, description: 'No autorizado' })
  @ApiResponse({ status: 403, description: 'Sin permiso discounts:delete' })
  @ApiResponse({ status: 404, description: 'Descuento no encontrado' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
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
