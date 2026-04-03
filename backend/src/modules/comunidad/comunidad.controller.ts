import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ComunidadService } from './comunidad.service';
import { CreateComunidadDto } from './dto/create-comunidad.dto';
import { UpdateComunidadDto } from './dto/update-comunidad.dto';

@Controller('comunidad')
export class ComunidadController {
  constructor(private readonly comunidadService: ComunidadService) {}

  @Post()
  create(@Body() createComunidadDto: CreateComunidadDto) {
    return this.comunidadService.create(createComunidadDto);
  }

  @Get()
  findAll() {
    return this.comunidadService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comunidadService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateComunidadDto: UpdateComunidadDto) {
    return this.comunidadService.update(+id, updateComunidadDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comunidadService.remove(+id);
  }
}
