import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';

@Injectable()
export class PrismaReadingAnomalyRepository implements ReadingAnomalyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(
    where: Prisma.LecturaAnomaliaWhereUniqueInput,
  ): Promise<any> {
    return this.prisma.lecturaAnomalia.findUnique({ where });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
    orderBy?: Prisma.LecturaAnomaliaOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.lecturaAnomalia.findMany(params);
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
