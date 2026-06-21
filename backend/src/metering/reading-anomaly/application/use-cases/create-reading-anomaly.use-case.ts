import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { ReadingRepository } from 'src/metering/readings/domain/repositories/reading.repository';
import { CreateReadingAnomalyDto } from '../../interfaces/dto/create-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { EstadoLectura } from 'src/shared/enums';

@Injectable()
export class CreateReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
    private readonly readingRepository: ReadingRepository,
  ) {}

  async execute(
    createDto: CreateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    const lecturaId = BigInt(createDto.lecturaId);

    const anomaly = await this.readingAnomalyRepository.create({
      lecturaId,
      observacion: createDto.observacion,
      tipo: createDto.tipo,
      estado: createDto.estado,
    });

    await this.readingRepository.update(
      { lecturaId },
      { estado: EstadoLectura.CON_NOVEDAD },
    );

    return anomaly;
  }
}
