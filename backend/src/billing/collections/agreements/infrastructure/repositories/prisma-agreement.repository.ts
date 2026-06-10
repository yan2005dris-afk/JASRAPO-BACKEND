import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';

@Injectable()
export class PrismaAgreementRepository implements AgreementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findFirstConvenio(
    where: Prisma.ConveniosWhereInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any> {
    return this.prisma.convenios.findFirst({ where, select });
  }

  async findUniqueConvenio(
    where: Prisma.ConveniosWhereUniqueInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any> {
    return this.prisma.convenios.findUnique({ where, select });
  }

  async findManyConvenios(params: {
    select?: Prisma.ConveniosSelect;
    where?: Prisma.ConveniosWhereInput;
    orderBy?: Prisma.ConveniosOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]> {
    return this.prisma.convenios.findMany(params);
  }

  async createConvenio(
    data: Prisma.ConveniosCreateInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any> {
    return this.prisma.convenios.create({ data, select });
  }

  async updateConvenio(
    where: Prisma.ConveniosWhereUniqueInput,
    data: Prisma.ConveniosUpdateInput,
    select?: Prisma.ConveniosSelect,
  ): Promise<any> {
    return this.prisma.convenios.update({ where, data, select });
  }

  async findFirstContrato(
    where: Prisma.ContratosWhereInput,
    select?: Prisma.ContratosSelect,
  ): Promise<any> {
    return this.prisma.contratos.findFirst({ where, select });
  }

  async findFirstParametroTasainteres(
    where: Prisma.ParametroTasainteresWhereInput,
    orderBy?: Prisma.ParametroTasainteresOrderByWithRelationInput,
    select?: Prisma.ParametroTasainteresSelect,
  ): Promise<any> {
    return this.prisma.parametroTasainteres.findFirst({
      where,
      orderBy,
      select,
    });
  }

  async findManyPrefacturas(params: {
    where: Prisma.PrefacturasWhereInput;
    select?: Prisma.PrefacturasSelect;
    orderBy?: Prisma.PrefacturasOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.prefacturas.findMany(params);
  }

  async findManyCuotaConvenio(params: {
    where: Prisma.CuotaConvenioWhereInput;
    select?: Prisma.CuotaConvenioSelect;
    orderBy?: Prisma.CuotaConvenioOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.cuotaConvenio.findMany(params);
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
