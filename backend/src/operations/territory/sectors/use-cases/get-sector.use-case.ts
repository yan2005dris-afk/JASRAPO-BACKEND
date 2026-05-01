import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class GetSectorUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const sector = await this.prisma.sectores.findUnique({
      where: { sectorId: id },
    });

    if (!sector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    return sector;
  }
}
