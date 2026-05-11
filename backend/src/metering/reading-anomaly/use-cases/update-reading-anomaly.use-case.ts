import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateReadingAnomalyDto } from '../dto/update-reading-anomaly.dto';
import { safeReadingAnomaliesSelect } from '../types/IResponseReadingAnomaly';
import { toReadingAnomalyResponse } from '../types/readingAnomalyMapper';

@Injectable()
export class UpdateReadingAnomalyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: bigint,
    updateDto: UpdateReadingAnomalyDto,
  ) {
    const existing = await this.prisma.lecturaAnomalia.findFirst({
      where: { anomaliaId: id, deletedAt: null },
    });
    if (!existing) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.lecturaId)
      dataToUpdate.lecturaId = BigInt(updateDto.lecturaId);

    const anomalia = await this.prisma.lecturaAnomalia.update({
      where: { anomaliaId: id },
      data: dataToUpdate,
      select: safeReadingAnomaliesSelect,
    });
    return toReadingAnomalyResponse(anomalia);
  }
}
