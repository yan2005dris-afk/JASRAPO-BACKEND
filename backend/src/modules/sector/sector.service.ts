import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { PrismaService } from 'src/database/prisma.service';

@Injectable()
export class SectorService {
 
  constructor(private prisma: PrismaService){}
  
  async crearSector(createSectorDto: CreateSectorDto) {
    const comunidad = await this.prisma.comunidades.findUnique({
      where: { comunidadId: createSectorDto.comunidadId }
    });

    if (!comunidad){
      throw new NotFoundException('La comunidad no existe');
    }
    
    return this.prisma.sectores.create({
      data: createSectorDto
    });
  }

  findAll() {
    return this.prisma.sectores.findMany();
  }

  findOne(id: number) {
    return this.prisma.sectores.findUnique({
      where: {
        sectorId: id
      }
    });
  }

  actualizarSector(id: number, updateSectorDto: UpdateSectorDto) {
     return this.prisma.sectores.update({
      where: {
        sectorId: id
      },
      data: updateSectorDto
    });
  }

  eliminarSector(id: number) {
    return this.prisma.sectores.delete({
      where: {
        sectorId: id
      }
    });
  }
}
