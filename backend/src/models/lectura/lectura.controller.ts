import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LecturaService } from './lectura.service';
import { CrearLecturaDto } from './dto/create-lectura.dto';
import { ActualizarLecturaDto } from './dto/update-lectura.dto';
import { LecturaEntity } from './entities/lectura.entity';

@Controller('lecturas')
export class LecturaController {
  constructor(private readonly lecturaService: LecturaService) {}

  @Post()
  async CrearLectura(@Body() crearLecturaDto: CrearLecturaDto): Promise<LecturaEntity> {
    return this.lecturaService.crearLectura(crearLecturaDto);
  }

  @Get()
  async buscarLecturas(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('contratoId') contratoId?: string,
  ): Promise<LecturaEntity[]> {
    const where: any = {};
    if (contratoId) where.contratoId = BigInt(contratoId);
    return this.lecturaService.buscarLecturas({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  @Get(':id')
  async buscarLectura(@Param('id') id: string): Promise<LecturaEntity> {
    return this.lecturaService.buscarLectura(BigInt(id));
  }

  @Patch(':id')
  async actualizarLectura(@Param('id') id: string, @Body() updateLecturaDto: ActualizarLecturaDto): Promise<LecturaEntity> {
    return this.lecturaService.actualizarLectura(BigInt(id), updateLecturaDto);
  }

  @Delete(':id')
  async eliminarLectura(@Param('id') id: string) {
    return this.lecturaService.eliminarLectura(BigInt(id));
  }
}