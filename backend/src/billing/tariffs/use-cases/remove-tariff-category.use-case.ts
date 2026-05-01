import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class RemoveTariffCategoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: number) {
    const current = await this.prisma.categoriaTarifa.findFirst({
      where: {
        categoriaTarifaId: id,
        activo: true,
        deletedAt: null,
      },
    });

    if (!current) {
      throw new NotFoundException('Categoría no encontrada o ya eliminada');
    }

    const now = new Date();

    return this.prisma.categoriaTarifa.update({
      where: { categoriaTarifaId: id },
      data: {
        activo: false,
        fechaVigenciaHasta: now,
        deletedAt: now,
        updatedAt: now,
      },
    });
  }
}
