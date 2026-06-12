import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/identity/auth/interfaces/http/guards/jwt-auth.guard';
import { PermissionsGuard } from 'src/infrastructure/common/guards/permissions.guard';
import { GenerarLoteDto } from '../dto/generar-lote.dto';
import { LoteService } from '../../application/lote.service';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

@ApiTags('Lotes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('lotes')
export class LoteController {
  constructor(private readonly loteService: LoteService) {}

  @Post('generar')
  @ApiOperation({ summary: 'Generar un nuevo lote de prefacturas masivamente' })
  async generar(@Body() dto: GenerarLoteDto) {
    return this.loteService.generarLote(dto);
  }

  @Get('status')
  @ApiOperation({
    summary: 'Catálogo de estados de lote',
    description:
      'Retorna lista de estados disponibles para lotes de facturación',
  })
  async findAllEstados() {
    return this.loteService.findAllEstados();
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos los lotes de facturación' })
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.loteService.findAll(paginationDto.page, paginationDto.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener detalle de un lote por ID' })
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.loteService.findOne(id);
  }
}
