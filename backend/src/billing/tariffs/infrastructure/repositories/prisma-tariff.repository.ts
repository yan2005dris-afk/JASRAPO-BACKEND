import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { TariffRepository } from '../../domain/repositories/tariff.repository';

@Injectable()
export class PrismaTariffRepository implements TariffRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirst(where: Prisma.CategoriaTarifaWhereInput): Promise<any> {
    return this.prisma.categoriaTarifa.findFirst({ where });
  }

  async findMany(params: {
    where?: Prisma.CategoriaTarifaWhereInput;
    orderBy?: Prisma.CategoriaTarifaOrderByWithRelationInput;
    skip?: number;
    take?: number;
    select?: Prisma.CategoriaTarifaSelect;
  }): Promise<any[]> {
    return this.prisma.categoriaTarifa.findMany(params);
  }

  async count(params: {
    where?: Prisma.CategoriaTarifaWhereInput;
  }): Promise<number> {
    return this.prisma.categoriaTarifa.count(params);
  }

  async create(data: Prisma.CategoriaTarifaCreateInput): Promise<any> {
    return this.prisma.categoriaTarifa.create({ data });
  }

  async update(
    where: Prisma.CategoriaTarifaWhereUniqueInput,
    data: Prisma.CategoriaTarifaUpdateInput,
  ): Promise<any> {
    return this.prisma.categoriaTarifa.update({ where, data });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
