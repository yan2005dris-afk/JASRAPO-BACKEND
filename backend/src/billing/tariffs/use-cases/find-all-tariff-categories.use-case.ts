import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

@Injectable()
export class FindAllTariffCategoriesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(nombre?: string) {
    return this.prisma.categoriaTarifa.findMany({
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
      orderBy: { createdAt: 'desc' },
    });
  }
}
