import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { BusquedaPublicaService } from './busqueda-publica.service';
import { CreateBusquedaPublicaDto } from './dto/create-busqueda-publica.dto';
import { UpdateBusquedaPublicaDto } from './dto/update-busqueda-publica.dto';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

@ApiTags('busqueda-publica')
@Controller('busqueda-publica')
export class BusquedaPublicaController {
  constructor(
    private readonly busquedaPublicaService: BusquedaPublicaService,
  ) {}

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
