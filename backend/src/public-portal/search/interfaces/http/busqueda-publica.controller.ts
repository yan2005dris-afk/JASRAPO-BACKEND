import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { BusquedaPublicaService } from '../../application/busqueda-publica.service';
import { CreateBusquedaPublicaDto } from '../dto/create-busqueda-publica.dto';
import { SearchDeudaDto } from '../dto/search-deuda.dto';

@ApiTags('search')
@Controller('search')
@UseGuards(ThrottlerGuard)
export class BusquedaPublicaController {
  constructor(
    private readonly busquedaPublicaService: BusquedaPublicaService,
  ) {}

  @ApiOperation({
    summary: 'Búsqueda pública de clientes y contratos',
    description:
      'Busca clientes (por identificación o nombre) y contratos (por número de guía).',
  })
  @ApiResponse({ status: 200, description: 'Resultados de búsqueda' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @Get()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  searchPublic(@Query() query: CreateBusquedaPublicaDto) {
    return this.busquedaPublicaService.search(
      query.tipo,
      query.valor,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }

  @ApiOperation({
    summary: 'Consulta pública de deuda',
    description:
      'Retorna el resumen de deuda de un cliente o contrato. Búsqueda por identificación, nombre o número de guía.',
  })
  @ApiResponse({ status: 200, description: 'Resumen de deuda' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @Get('deuda')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  searchDeuda(@Query() query: SearchDeudaDto) {
    return this.busquedaPublicaService.searchDeuda(
      query.tipo,
      query.valor,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }
}
