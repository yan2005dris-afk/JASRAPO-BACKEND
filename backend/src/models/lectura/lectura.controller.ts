import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { LecturaService } from './lectura.service';
import { CreateLecturaDto } from './dto/create-lectura.dto';
import { UpdateLecturaDto } from './dto/update-lectura.dto';
import { LecturaEntity } from './entities/lectura.entity';

@Controller('lecturas')
export class LecturaController {
  constructor(private readonly lecturaService: LecturaService) {}

  @Post()
  async create(@Body() createLecturaDto: CreateLecturaDto): Promise<LecturaEntity> {
    return this.lecturaService.create(createLecturaDto);
  }

  @Get()
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('contratoId') contratoId?: string,
  ): Promise<LecturaEntity[]> {
    const where: any = {};
    if (contratoId) where.contratoId = BigInt(contratoId);
    return this.lecturaService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LecturaEntity> {
    return this.lecturaService.findOne(BigInt(id));
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateLecturaDto: UpdateLecturaDto): Promise<LecturaEntity> {
    return this.lecturaService.update(BigInt(id), updateLecturaDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.lecturaService.remove(BigInt(id));
  }
}