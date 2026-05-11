import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemoveReadingUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const existing = await this.prisma.lecturas.findFirst({
      where: { lecturaId: id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Lectura con ID ${id} no encontrada`);
    }

    await this.prisma.lecturas.update({
      where: { lecturaId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Lectura con ID ${id} eliminada` };
  }
}
