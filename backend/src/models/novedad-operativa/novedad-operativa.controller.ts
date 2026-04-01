import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NovedadOperativaService } from './novedad-operativa.service';
import { CreateNovedadOperativaDto } from './dto/create-novedad-operativa.dto';
import { UpdateNovedadOperativaDto } from './dto/update-novedad-operativa.dto';
import { NovedadOperativaEntity } from './entities/novedad-operativa.entity';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/client';

@Controller('novedades-operativas')
export class NovedadOperativaController {
  constructor(private readonly novedadOperativaService: NovedadOperativaService) {}

  @Post()
  async create(@Body() createDto: CreateNovedadOperativaDto): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.create(createDto);
  }

  @Get()
  async findAll(
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

    return this.novedadOperativaService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.findOne(BigInt(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateNovedadOperativaDto): Promise<NovedadOperativaEntity> {
    return this.novedadOperativaService.update(BigInt(id), updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.novedadOperativaService.remove(BigInt(id));
  }
}