import { Injectable } from '@nestjs/common';
import { CreateSectorDto } from './dto/create-sector.dto';
import { UpdateSectorDto } from './dto/update-sector.dto';
import { PrismaService } from 'src/database/prisma.service' ;

@Injectable()
export class SectorService {

  constructor(private prisma: PrismaService){}


  create(createSectorDto: CreateSectorDto) {
    return 'This action adds a new sector';
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

  update(id: number, updateSectorDto: UpdateSectorDto) {
    return `This action updates a #${id} sector`;
  }

  remove(id: number) {
    return `This action removes a #${id} sector`;
  }
}
