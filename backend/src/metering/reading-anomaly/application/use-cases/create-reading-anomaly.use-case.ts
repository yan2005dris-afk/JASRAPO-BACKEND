import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { CreateReadingAnomalyDto } from '../../interfaces/dto/create-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';

@Injectable()
export class CreateReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(
    createDto: CreateReadingAnomalyDto,
  ): Promise<ReadingAnomalyEntity> {
    return this.readingAnomalyRepository.create({
      lecturaId: BigInt(createDto.lecturaId),
      observacion: createDto.observacion,
      tipo: createDto.tipo,
      estado: createDto.estado,
    });
  }
}
