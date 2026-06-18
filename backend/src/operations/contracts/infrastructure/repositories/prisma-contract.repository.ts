import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { CreateContractData } from '../../domain/types/create-contract-data';
import { ContractMapper } from '../mappers/contract.mapper';

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  private readonly defaultInclude = {
    categoriaTarifa: true,
    cliente: true,
    comunidad: true,
    sector: true,
    historialMedidores: {
      include: { medidor: true },
    },
  } satisfies Prisma.ContratosInclude;

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateContractData): Promise<ContractEntity> {
    const { medidorId, lecturaInicial, ...contractFields } = data;
    const record = await this.prisma.contratos.create({
      data: contractFields as Prisma.ContratosUncheckedCreateInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record)!;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<ContractEntity[]> {
    const records = await this.prisma.contratos.findMany({
      skip: params.skip,
      take: params.take,
      where: (params.where ?? {}) as Prisma.ContratosWhereInput,
      orderBy: params.orderBy as Prisma.ContratosOrderByWithRelationInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomainList(records);
  }

  async findUnique(where: Record<string, any>): Promise<ContractEntity | null> {
    const record = await this.prisma.contratos.findUnique({
      where: where as Prisma.ContratosWhereUniqueInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record);
  }

  async count(params: { where?: Record<string, any> }): Promise<number> {
    return this.prisma.contratos.count({
      where: params.where as Prisma.ContratosWhereInput,
    });
  }

  async update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<ContractEntity> {
    const record = await this.prisma.contratos.update({
      where: where as Prisma.ContratosWhereUniqueInput,
      data: data as Prisma.ContratosUpdateInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record)!;
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
