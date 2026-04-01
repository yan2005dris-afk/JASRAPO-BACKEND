import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SectorService } from './sector.service';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';

@Controller('sector')
export class SectorController {
  constructor(private readonly sectorService: SectorService) {}

  @Post()
  create(@Body() createSectorDto: CreateSectorDto) {
    return this.sectorService.create(createSectorDto);
  }

  @Get()
  findAll() {
    return this.sectorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.sectorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSectorDto: UpdateSectorDto) {
    return this.sectorService.update(+id, updateSectorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.sectorService.remove(+id);
  }
}
