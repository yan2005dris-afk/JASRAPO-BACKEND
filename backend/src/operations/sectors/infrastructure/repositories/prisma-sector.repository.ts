import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { SectorRepository } from '../../domain/repositories/sector.repository';

@Injectable()
export class PrismaSectorRepository implements SectorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.SectoresWhereUniqueInput,
    select?: Prisma.SectoresSelect,
  ): Promise<any> {
    return this.prisma.sectores.findUnique({ where, select });
  }

  async findMany(params?: {
    where?: Prisma.SectoresWhereInput;
    orderBy?: Prisma.SectoresOrderByWithRelationInput;
    skip?: number;
    take?: number;
    select?: Prisma.SectoresSelect;
    include?: Prisma.SectoresInclude;
  }): Promise<any[]> {
    return this.prisma.sectores.findMany(params);
  }

  async count(params: {
    where?: Prisma.SectoresWhereInput;
  }): Promise<number> {
    return this.prisma.sectores.count(params);
  }

  async create(data: Prisma.SectoresCreateInput): Promise<any> {
    return this.prisma.sectores.create({ data });
  }

  async update(
    where: Prisma.SectoresWhereUniqueInput,
    data: Prisma.SectoresUpdateInput,
  ): Promise<any> {
    return this.prisma.sectores.update({ where, data });
  }

  async delete(where: Prisma.SectoresWhereUniqueInput): Promise<any> {
    return this.prisma.sectores.delete({ where });
  }

  async findComunidad(where: Prisma.ComunidadesWhereUniqueInput): Promise<any> {
    return this.prisma.comunidades.findUnique({ where });
  }
}
