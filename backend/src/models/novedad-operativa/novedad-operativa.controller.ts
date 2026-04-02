import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NovedadOperativaService } from './novedad-operativa.service';
import {  CrearNovedadOperativaDto } from './dto/create-novedad-operativa.dto';
import { ActualizarNovedadOperativaDto } from './dto/update-novedad-operativa.dto';
import { NovedadOperativaEntity } from './entities/novedad-operativa.entity';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/client';

@Controller('novedades-operativas')
export class NovedadOperativaController {
  constructor(private readonly novedadOperativaService: NovedadOperativaService) {}

  @Post()
  async crearNovedadOperativa(@Body() createDto: CrearNovedadOperativaDto): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.crearNovedadOperativa(createDto);
  }

  @Get()
  async buscarNovedades(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('lecturaId') lecturaId?: string,
    @Query('tipo') tipo?: TipoNovedad,
    @Query('estado') estado?: EstadoNovedad,
  ): Promise<NovedadOperativaEntity[]> {
    const where: any = {};
    if (lecturaId) where.lecturaId = BigInt(lecturaId);
    if (tipo) where.tipo = tipo;
    if (estado) where.estado = estado;

    return this.novedadOperativaService.buscarNovedades({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  @Get(':id')
  async buscarNovedad(@Param('id') id: string): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.buscarNovedad(BigInt(id));
  }

  @Patch(':id')
  async actualizarNovedad(@Param('id') id: string, @Body() updateDto: ActualizarNovedadOperativaDto): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.actualizarNovedad(BigInt(id), updateDto);
  }

  @Delete(':id')
  async eliminarNovedad(@Param('id') id: string) {
    return this.novedadOperativaService.eliminarNovedad(BigInt(id));
  }
}