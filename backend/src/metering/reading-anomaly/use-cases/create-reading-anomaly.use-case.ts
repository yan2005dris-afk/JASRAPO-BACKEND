import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateReadingAnomalyDto } from '../dto/create-reading-anomaly.dto';
import { safeReadingAnomaliesSelect } from '../types/IResponseReadingAnomaly';
import { toReadingAnomalyResponse } from '../types/readingAnomalyMapper';

@Injectable()
export class CreateReadingAnomalyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    createDto: CreateReadingAnomalyDto,
  ) {
    const anomalia = await this.prisma.lecturaAnomalia.create({
      data: {
        lecturaId: BigInt(createDto.lecturaId),
        observacion: createDto.observacion,
        tipo: createDto.tipo,
        estado: createDto.estado,
      },
      select: safeReadingAnomaliesSelect,
    });
    return toReadingAnomalyResponse(anomalia);
  }
}
