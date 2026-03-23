import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { LecturaService } from './lectura.service';
import { CreateLecturaDto } from './dto/create-lectura.dto';
import { UpdateLecturaDto } from './dto/update-lectura.dto';
import { LecturaEntity } from './entities/lectura.entity';

@Controller('lecturas')
export class LecturaController {
  constructor(private readonly lecturaService: LecturaService) {}

  /**
   * Crea una nueva lectura.
   * Recibe los datos del DTO y delega la lógica de creación al servicio.
   */
  @Post()
  async create(
    @Body() createLecturaDto: CreateLecturaDto,
  ): Promise<LecturaEntity> {
    return this.lecturaService.create(createLecturaDto);
  }

  /**
   * Obtiene todas las lecturas.
   * Permite paginación opcional con skip y take.
   * Permite filtrar por clienteMedidorId y por rango de fechas (fechaInicio y fechaFin).
   */
  @Get()
  async findAll(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
    @Query('clienteMedidorId') clienteMedidorId?: string,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
  ): Promise<LecturaEntity[]> {
    const where: any = {};

    if (clienteMedidorId) {
      where.clienteMedidorId = BigInt(clienteMedidorId);
    }

    if (fechaInicio || fechaFin) {
      where.fecha = {};
      if (fechaInicio) where.fecha.gte = new Date(fechaInicio);
      if (fechaFin) where.fecha.lte = new Date(fechaFin);
    }

    return this.lecturaService.findAll({
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined,
      where,
    });
  }

  /**
   * Obtiene una lectura por su ID.
   * Si la lectura no existe o fue eliminada lógicamente, el servicio lanzará una NotFoundException.
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LecturaEntity> {
    return this.lecturaService.findOne(BigInt(id));
  }

  /**
   * Actualiza una lectura existente por su ID.
   * Si la lectura no existe o está eliminada, el servicio lanzará una NotFoundException.
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLecturaDto: UpdateLecturaDto,
  ): Promise<LecturaEntity> {
    return this.lecturaService.update(BigInt(id), updateLecturaDto);
  }

  /**
   * Elimina una lectura de forma lógica (soft delete).
   * Se actualiza el campo deletedAt con la fecha actual.
   * Si la lectura no existe o ya fue eliminada, el servicio lanzará una NotFoundException.
   */
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.lecturaService.remove(BigInt(id));
  }
}
