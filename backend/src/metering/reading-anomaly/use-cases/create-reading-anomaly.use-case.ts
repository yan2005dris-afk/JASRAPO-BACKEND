import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { CreateReadingAnomalyDto } from '../dto/create-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../entities/reading-anomaly.entity';

@Injectable()
export class CreateReadingAnomalyUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    createDto: CreateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    const anomalia = await this.prisma.lecturaAnomalia.create({
      data: {
        lecturaId: BigInt(createDto.lecturaId),
        observacion: createDto.observacion,
        tipo: createDto.tipo,
        estado: createDto.estado,
      },
    });
    return new ReadingAnomalyEntity(anomalia);
  }
}
