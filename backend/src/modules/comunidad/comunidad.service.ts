import { Injectable } from '@nestjs/common';
import { CreateComunidadDto } from './dto/create-comunidad.dto';
import { UpdateComunidadDto } from './dto/update-comunidad.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ComunidadService {
  constructor(private prisma: PrismaService) {}

  crearComunidad(CreateComunidadDto: CreateComunidadDto) {
    return this.prisma.comunidades.create({
      data: CreateComunidadDto,
    });
  }

  findAll() {
    return this.prisma.comunidades.findMany();
  }

  findOne(id: number) {
    return this.prisma.comunidades.findUnique({
      where: {
        comunidadId: id,
      },
    });
  }

  actualizarComunidad(id: number, updateComunidadDto: UpdateComunidadDto) {
    return this.prisma.comunidades.update({
      where: {
        comunidadId: id,
      },
      data: updateComunidadDto,
    });
  }

  eliminarActualizar(id: number) {
    return this.prisma.comunidades.delete({
      where: {
        comunidadId: id,
      },
    });
  }
}
