import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { UpdateReadingAnomalyDto } from '../dto/update-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../entities/reading-anomaly.entity';

@Injectable()
export class UpdateReadingAnomalyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    id: bigint,
    updateDto: UpdateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    const existing = await this.prisma.lecturaAnomalia.findUnique({
      where: { anomaliaId: id },
    });
    if (!existing || existing.deletedAt) {
      throw new NotFoundException(`Anomalía con ID ${id} no encontrada`);
    }

    const dataToUpdate: any = { ...updateDto };
    if (updateDto.lecturaId)
      dataToUpdate.lecturaId = BigInt(updateDto.lecturaId);

    const anomalia = await this.prisma.lecturaAnomalia.update({
      where: { anomaliaId: id },
      data: dataToUpdate,
    });
    return new ReadingAnomalyEntity(anomalia);
  }
}
