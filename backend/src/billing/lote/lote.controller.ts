import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { GenerarLoteDto } from './dto/generar-lote.dto';
import { LoteService } from './lote.service';

@ApiTags('Lotes')
@Controller('lotes')
export class LoteController {
  constructor(private readonly loteService: LoteService) {}

  @Post('generar')
  @ApiOperation({ summary: 'Generar un nuevo lote de prefacturas masivamente' })
  async generar(@Body() dto: GenerarLoteDto) {
    return this.loteService.generarLote(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes de facturación' })
  async findAll() {
    return this.loteService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un lote por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loteService.findOne(id);
  }
}
