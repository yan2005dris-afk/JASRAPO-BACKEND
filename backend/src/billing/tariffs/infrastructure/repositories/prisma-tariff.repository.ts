import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { TariffRepository } from '../../domain/repositories/tariff.repository';

export const safeTariffCategoriesSelect = {
  categoriaTarifaId: true,
  nombre: true,
  descripcion: true,
  valorBase: true,
  consumoMinimoMensual: true,
  valorExcedenteM3: true,
  fechaVigenciaDesde: true,
  fechaVigenciaHasta: true,
  activo: true,
} satisfies Prisma.CategoriaTarifaSelect;

@Injectable()
export class PrismaTariffRepository implements TariffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(where: Prisma.CategoriaTarifaWhereInput): Promise<any> {
    return this.prisma.categoriaTarifa.findFirst({
      where,
      select: safeTariffCategoriesSelect,
    });
  }

  async findMany(params: {
    where?: Prisma.CategoriaTarifaWhereInput;
    orderBy?: Prisma.CategoriaTarifaOrderByWithRelationInput;
    skip?: number;
    take?: number;
    select?: Prisma.CategoriaTarifaSelect;
  }): Promise<any[]> {
    return this.prisma.categoriaTarifa.findMany({
      ...params,
      select: params.select ?? safeTariffCategoriesSelect,
    });
  }

  async count(params: {
    where?: Prisma.CategoriaTarifaWhereInput;
  }): Promise<number> {
    return this.prisma.categoriaTarifa.count(params);
  }

  async create(data: Prisma.CategoriaTarifaCreateInput): Promise<any> {
    return this.prisma.categoriaTarifa.create({
      data,
      select: safeTariffCategoriesSelect,
    });
  }

  async update(
    where: Prisma.CategoriaTarifaWhereUniqueInput,
    data: Prisma.CategoriaTarifaUpdateInput,
  ): Promise<any> {
    return this.prisma.categoriaTarifa.update({
      where,
      data,
      select: safeTariffCategoriesSelect,
    });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
