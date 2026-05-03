import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ReadingAnomalyEntity } from '../entities/reading-anomaly.entity';

@Injectable()
export class FindAllReadingAnomaliesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
  }): Promise<ReadingAnomalyEntity[]> {
    const { skip, take, where } = params;
    const anomalias = await this.prisma.lecturaAnomalia.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return anomalias.map((n) => new ReadingAnomalyEntity(n));
  }
}
