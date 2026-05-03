import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { ReadingAnomalyEntity } from '../entities/reading-anomaly.entity';

@Injectable()
export class FindOneReadingAnomalyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint): Promise<ReadingAnomalyEntity> {
    const anomalia = await this.prisma.lecturaAnomalia.findUnique({
      where: { anomaliaId: id },
    });
    if (!anomalia || anomalia.deletedAt) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }
    return new ReadingAnomalyEntity(anomalia);
  }
}
