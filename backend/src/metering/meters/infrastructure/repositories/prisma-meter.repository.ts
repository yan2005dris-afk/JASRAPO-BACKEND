import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { MeterRepository } from '../../domain/repositories/meter.repository';

@Injectable()
export class PrismaMeterRepository implements MeterRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.MedidoresWhereUniqueInput,
    select?: Prisma.MedidoresSelect,
  ): Promise<any> {
    return this.prisma.medidores.findUnique({ where, select });
  }

  async findMany(params: {
    select?: Prisma.MedidoresSelect;
    where?: Prisma.MedidoresWhereInput;
    orderBy?: Prisma.MedidoresOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]> {
    return this.prisma.medidores.findMany(params);
  }

  async create(
    data: Prisma.MedidoresCreateInput,
    select?: Prisma.MedidoresSelect,
  ): Promise<any> {
    return this.prisma.medidores.create({ data, select });
  }

  async update(
    where: Prisma.MedidoresWhereUniqueInput,
    data: Prisma.MedidoresUpdateInput,
    select?: Prisma.MedidoresSelect,
    tx?: any,
  ): Promise<any> {
    const client = tx || this.prisma;
    return client.medidores.update({ where, data, select });
  }

  async createHistory(
    data: Prisma.HistorialMedidoresCreateInput | Prisma.HistorialMedidoresUncheckedCreateInput,
    tx?: any,
  ): Promise<any> {
    const client = tx || this.prisma;
    return client.historialMedidores.create({ data });
  }

  async executeTransaction<T>(
    callback: (tx: any) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
