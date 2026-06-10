import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CommunityRepository } from '../../domain/repositories/community.repository';

@Injectable()
export class PrismaCommunityRepository implements CommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.ComunidadesWhereUniqueInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any> {
    return this.prisma.comunidades.findUnique({ where, select });
  }

  async findFirst(
    where: Prisma.ComunidadesWhereInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any> {
    return this.prisma.comunidades.findFirst({ where, select });
  }

  async findMany(params: {
    select?: Prisma.ComunidadesSelect;
    where?: Prisma.ComunidadesWhereInput;
    orderBy?: Prisma.ComunidadesOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]> {
    return this.prisma.comunidades.findMany(params);
  }

  async create(
    data: Prisma.ComunidadesCreateInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any> {
    return this.prisma.comunidades.create({ data, select });
  }

  async update(
    where: Prisma.ComunidadesWhereUniqueInput,
    data: Prisma.ComunidadesUpdateInput,
    select?: Prisma.ComunidadesSelect,
  ): Promise<any> {
    return this.prisma.comunidades.update({ where, data, select });
  }
}
