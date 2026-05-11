import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { safeReadingAnomaliesSelect } from '../types/IResponseReadingAnomaly';
import { toReadingAnomalyResponse } from '../types/readingAnomalyMapper';

@Injectable()
export class FindAllReadingAnomaliesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
  }) {
    const { skip, take, where } = params;
    const anomalies = await this.prisma.lecturaAnomalia.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      select: safeReadingAnomaliesSelect,
      orderBy: { createdAt: 'desc' },
    });
    return anomalies.map(toReadingAnomalyResponse);
  }
}
