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
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DiscountsService } from '../../application/discounts.service';
import { CreateDiscountDto } from '../dto/create-discount.dto';
import { UpdateDiscountDto } from '../dto/update-discount.dto';
import { DiscountFilterDto } from '../dto/discount-filter.dto';
import { ApplyDiscountToPreinvoiceDto } from '../dto/apply-discount-to-preinvoice.dto';

@ApiTags('Descuentos')
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear un nuevo descuento' })
  @ApiResponse({ status: 201, description: 'Descuento creado exitosamente' })
  create(@Body() dto: CreateDiscountDto) {
    return this.discountsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar descuentos con filtros' })
  findAll(@Query() filter: DiscountFilterDto) {
    return this.discountsService.findAll(filter);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un descuento por ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un descuento' })
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
  @ApiOperation({ summary: 'Desactivar un descuento (soft-delete)' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.discountsService.remove(id);
  }

  @Post('apply-to-preinvoice/:prefacturaId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Aplicar descuento manual a una prefactura' })
  @ApiResponse({ status: 200, description: 'Descuento aplicado correctamente' })
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
