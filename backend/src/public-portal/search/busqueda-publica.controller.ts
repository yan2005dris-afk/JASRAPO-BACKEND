import { Controller, Get, Query } from '@nestjs/common';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { CreateBusquedaPublicaDto } from './dto/create-busqueda-publica.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('search')
@Controller('search')
export class BusquedaPublicaController {
  constructor(
    private readonly busquedaPublicaService: BusquedaPublicaService,
  ) {}

  @ApiOperation({
    summary: 'Búsqueda pública',
    description:
      'Endpoint público para buscar información. Permite búsqueda por identificación, nombres, apellidos o nombre completo.',
  })
  @ApiQuery({
    name: 'tipo',
    description: 'Tipo de búsqueda',
    enum: ['identificacion', 'nombres', 'apellidos', 'nombreCompleto'],
    required: true,
    example: 'identificacion',
  })
  @ApiQuery({
    name: 'valor',
    description: 'Texto a buscar',
    required: true,
    example: '12345678',
  })
  @ApiQuery({
    name: 'page',
    description: 'Número de página',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'limit',
    description: 'Resultados por página',
    required: false,
    type: Number,
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
}
