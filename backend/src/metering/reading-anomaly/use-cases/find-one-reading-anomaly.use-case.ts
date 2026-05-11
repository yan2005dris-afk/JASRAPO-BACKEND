import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { safeReadingAnomaliesSelect } from '../types/IResponseReadingAnomaly';
import { toReadingAnomalyResponse } from '../types/readingAnomalyMapper';

@Injectable()
export class FindOneReadingAnomalyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: bigint) {
    const anomalia = await this.prisma.lecturaAnomalia.findFirst({
      where: { anomaliaId: id, deletedAt: null },
      select: safeReadingAnomaliesSelect,
    });
    if (!anomalia) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }
    return toReadingAnomalyResponse(anomalia);
  }
}
