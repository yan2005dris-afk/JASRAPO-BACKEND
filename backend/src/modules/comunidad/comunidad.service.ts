import { Injectable } from '@nestjs/common';
import { CreateComunidadeDto } from './dto/create-comunidad.dto';
import { UpdateComunidadDto } from './dto/update-comunidad.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class ComunidadService {

  constructor(private prisma: PrismaService){}
  
  create(CreateComunidadeDto: CreateComunidadeDto) {
    return 'This action adds a new comunidad';
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
    return `This action updates a #${id} comunidad`;
  }

  remove(id: number) {
    return `This action removes a #${id} comunidad`;
  }
}
