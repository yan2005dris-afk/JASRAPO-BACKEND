import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from '../../../../infrastructure/common/decorators/public.decorator';
import { BusquedaPublicaService } from '../../application/busqueda-publica.service';
import { SearchDeudaDto } from '../dto/search-deuda.dto';

@ApiTags('search')
@Public()
@Controller('search')
@UseGuards(ThrottlerGuard)
export class BusquedaPublicaController {
  constructor(
    private readonly busquedaPublicaService: BusquedaPublicaService,
  ) {}

  @ApiOperation({
    summary: 'Búsqueda pública de clientes con deuda',
    description:
      'Busca clientes por identificación, nombre o número de guía y retorna sus contratos con resumen de deuda.',
  })
  @ApiResponse({ status: 200, description: 'Clientes con resumen de deuda' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @Get()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  search(@Query() query: SearchDeudaDto) {
    return this.busquedaPublicaService.search(
      query.tipo,
      query.valor,
      query.page ?? 1,
      query.limit ?? 10,
    );
  }
}
