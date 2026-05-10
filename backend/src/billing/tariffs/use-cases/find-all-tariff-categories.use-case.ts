import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeTariffCategoriesSelect } from '../types/IResponseTariffCategory';
import { toTariffCategoryResponse } from '../types/tariffCategoryMapper';

@Injectable()
export class FindAllTariffCategoriesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(nombre?: string) {
    const tariffs = await this.prisma.categoriaTarifa.findMany({
      where: {
        activo: true,
        deletedAt: null,
        ...(nombre && {
          nombre: {
            contains: nombre,
            mode: 'insensitive',
          },
        }),
      },
      select: safeTariffCategoriesSelect,
      orderBy: { createdAt: 'desc' },
    });

    return tariffs.map(toTariffCategoryResponse);
  }
}
