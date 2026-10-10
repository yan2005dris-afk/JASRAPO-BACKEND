import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Public } from 'src/common/decorators/public.decorator';
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
    summary: 'Búsqueda pública de cliente con deuda',
    description:
      'Busca un cliente por número de identificación (cédula/RUC/pasaporte) o por número de guía/contrato y retorna su resumen de deuda.',
  })
  @ApiResponse({ status: 200, description: 'Resumen de deuda del cliente' })
  @ApiResponse({ status: 400, description: 'Parámetros inválidos' })
  @ApiResponse({ status: 404, description: 'No se encontró registro de deuda' })
  @Get()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  search(@Query() query: SearchDeudaDto) {
    return this.busquedaPublicaService.search(query.tipo, query.valor);
  }
}
