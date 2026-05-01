import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemoveFieldWorkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const existing = await this.prisma.novedadOperativa.findUnique({ where: { novedadId: id } });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }

    await this.prisma.novedadOperativa.update({
      where: { novedadId: id },
      data: { deletedAt: new Date() },
    });
    return { message: `Novedad Operativa con ID ${id} eliminada` };
  }
}
