import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.ContratosWhereInput;
    orderBy?: Prisma.ContratosOrderByWithRelationInput;
    select?: Prisma.ContratosSelect;
    include?: Prisma.ContratosInclude;
  }): Promise<any[]> {
    return this.prisma.contratos.findMany(params);
  }

  async findUnique(
    where: Prisma.ContratosWhereUniqueInput,
    select?: Prisma.ContratosSelect,
  ): Promise<any> {
    return this.prisma.contratos.findUnique({ where, select });
  }

  async count(params: {
    where?: Prisma.ContratosWhereInput;
  }): Promise<number> {
    return this.prisma.contratos.count(params);
  }

  async update(
    where: Prisma.ContratosWhereUniqueInput,
    data: Prisma.ContratosUpdateInput,
  ): Promise<any> {
    return this.prisma.contratos.update({ where, data });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
