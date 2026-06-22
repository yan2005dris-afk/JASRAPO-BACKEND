import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { CreateReadingAnomalyDto } from '../../interfaces/dto/create-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { EstadoLectura } from 'src/shared/enums';

@Injectable()
export class CreateReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(
    createDto: CreateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    const lecturaId = BigInt(createDto.lecturaId);

    return this.readingAnomalyRepository.createAndMarkReadingWithAnomaly({
      lecturaId,
      observacion: createDto.observacion,
      tipo: createDto.tipo,
      estado: createDto.estado,
      nextEstadoLectura: EstadoLectura.CON_NOVEDAD,
    });
  }
}
