import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { Prisma } from 'src/generated/prisma/client';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';

@Injectable()
export class FindAllReadingAnomaliesUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LecturaAnomaliaWhereInput;
  }): Promise<ReadingAnomalyEntity[]> {
    const { skip, take, where } = params;
    const anomalias = await this.readingAnomalyRepository.findMany({
      skip,
      take,
      where: { ...where, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return anomalias.map((n) => new ReadingAnomalyEntity(n));
  }
}
