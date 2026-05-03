import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemoveReadingAnomalyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const existing = await this.prisma.lecturaAnomalia.findUnique({
      where: { anomaliaId: id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }

    await this.prisma.lecturaAnomalia.update({
      where: { anomaliaId: id },
      data: { deletedAt: new Date() },
    });
    return { message: 'Anomalía eliminada correctamente' };
  }
}
