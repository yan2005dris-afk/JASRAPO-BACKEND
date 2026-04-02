import { Injectable } from '@nestjs/common';
import { CreateComunidadeDto } from './dto/create-comunidad.dto';
import { UpdateComunidadDto } from './dto/update-comunidad.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ComunidadService {

  constructor(private prisma: PrismaService){}
  
  create(CreateComunidadeDto: CreateComunidadeDto) {
    return this.prisma.comunidades.create({
      data: CreateComunidadeDto
    });
  }

  findAll() {
    return this.prisma.comunidades.findMany();
  }

  findOne(id: number) {
    return this.prisma.comunidades.findUnique({
      where: {
        comunidadId: id
      }
    });
  }

  update(id: number, updateComunidadDto: UpdateComunidadDto) {
    return this.prisma.comunidades.update({
      where:{
        comunidadId: id
      },
      data: updateComunidadDto
    });
  }

  remove(id: number) {
    return this.prisma.comunidades.delete({
      where: {
        comunidadId: id
      }
    });
  }
}
