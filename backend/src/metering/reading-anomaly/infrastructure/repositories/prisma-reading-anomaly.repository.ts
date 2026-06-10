import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';

@Injectable()
export class PrismaReadingAnomalyRepository implements ReadingAnomalyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.LecturaAnomaliaWhereUniqueInput,
    select?: Prisma.LecturaAnomaliaSelect,
  ): Promise<any> {
    return this.prisma.lecturaAnomalia.findUnique({ where, select });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
    orderBy?: Prisma.LecturaAnomaliaOrderByWithRelationInput;
    select?: Prisma.LecturaAnomaliaSelect;
    include?: Prisma.LecturaAnomaliaInclude;
  }): Promise<any[]> {
    return this.prisma.lecturaAnomalia.findMany(params);
  }

  async count(params: {
    where?: Prisma.LecturaAnomaliaWhereInput;
  }): Promise<number> {
    return this.prisma.lecturaAnomalia.count(params);
  }

  async create(
    data: Prisma.LecturaAnomaliaCreateInput | Prisma.LecturaAnomaliaUncheckedCreateInput,
  ): Promise<any> {
    return this.prisma.lecturaAnomalia.create({ data });
  }

  async update(
    where: Prisma.LecturaAnomaliaWhereUniqueInput,
    data: Prisma.LecturaAnomaliaUpdateInput | Prisma.LecturaAnomaliaUncheckedUpdateInput,
  ): Promise<any> {
    return this.prisma.lecturaAnomalia.update({ where, data });
  }
}
