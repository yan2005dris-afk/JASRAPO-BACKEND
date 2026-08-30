import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { CreateReadingAnomalyDto } from '../../interfaces/dto/create-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import { EstadoLectura } from 'src/shared/enums';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

type CreateReadingAnomalyCommand = CreateReadingAnomalyDto & {
  fotoUrl?: string;
};

@Injectable()
export class CreateReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(
    createDto: CreateReadingAnomalyCommand,
  ): Promise<ReadingAnomalyEntity> {
    const lecturaId = this.validateLecturaId(createDto.lecturaId);

    return this.readingAnomalyRepository.createAndMarkReadingWithAnomaly({
      lecturaId,
      observacion: createDto.observacion,
      tipo: createDto.tipo,
      estado: createDto.estado,
      fotoUrl: createDto.fotoUrl,
      nextEstadoLectura: EstadoLectura.CON_NOVEDAD,
    });
  }

  private validateLecturaId(lecturaId: string | number): bigint {
    if (!/^\d+$/.test(String(lecturaId))) {
      throw new InvalidDomainOperationException(
        'lecturaId inválido: debe ser un número entero',
      );
    }
    return BigInt(lecturaId);
  }
}
