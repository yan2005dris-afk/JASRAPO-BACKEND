import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class DeleteSectorUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const sector = await this.prisma.sectores.findFirst({
      where: { sectorId: id, deletedAt: null },
    });

    if (!sector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    await this.prisma.sectores.update({
      where: { sectorId: id },
      data: { deletedAt: new Date() },
    });

    return {
      message: 'Sector eliminado exitosamente.',
      statusCode: 200,
    };
  }
}
