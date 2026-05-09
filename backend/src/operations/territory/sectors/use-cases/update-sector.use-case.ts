import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateSectorDto } from '../dto/update-sector.dto';
import { safeSectoresSelect } from '../types/IResponseSector';

@Injectable()
export class UpdateSectorUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number, dto: UpdateSectorDto) {
    const existingSector = await this.prisma.sectores.findFirst({
      where: { sectorId: id, deletedAt: null },
    });

    if (!existingSector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    return this.prisma.sectores.update({
      where: { sectorId: id },
      data: dto,
      select: safeSectoresSelect,
    });
  }
}
