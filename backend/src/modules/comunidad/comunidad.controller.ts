import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComunidadService } from './comunidad.service';
import { CreateComunidadeDto } from './dto/create-comunidad.dto';
import { UpdateComunidadDto } from './dto/update-comunidad.dto';
import { PrismaService } from 'src/database/prisma.service';

@Controller('comunidades')
export class ComunidadesController {
  
  constructor(private readonly comunidadesService: ComunidadService) {}

  @Post()
  create(@Body() createComunidadeDto: CreateComunidadeDto) {
    return this.comunidadesService.create(createComunidadeDto);
  }

  @Get()
  findAll() {
    return this.comunidadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comunidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComunidadeDto: UpdateComunidadDto) {
    return this.comunidadesService.update(+id, updateComunidadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comunidadesService.remove(+id);
  }
}
