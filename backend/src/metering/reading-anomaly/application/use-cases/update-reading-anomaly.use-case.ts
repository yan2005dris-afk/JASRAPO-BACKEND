import { Injectable } from '@nestjs/common';
import { ReadingAnomalyRepository } from '../../domain/repositories/reading-anomaly.repository';
import { UpdateReadingAnomalyDto } from '../../interfaces/dto/update-reading-anomaly.dto';
import { ReadingAnomalyEntity } from '../../domain/entities/reading-anomaly.entity';
import type { UpdateReadingAnomalyRepositoryData } from '../../domain/repositories/reading-anomaly.repository';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

type UpdateReadingAnomalyCommand = UpdateReadingAnomalyDto & {
  fotoUrl?: string;
};

@Injectable()
export class UpdateReadingAnomalyUseCase {
  constructor(
    private readonly readingAnomalyRepository: ReadingAnomalyRepository,
  ) {}

  async execute(
    id: bigint,
    updateDto: UpdateReadingAnomalyCommand,
  ): Promise<ReadingAnomalyEntity> {
    const existing = await this.readingAnomalyRepository.findUnique({
      anomaliaId: id,
    });
    if (!existing || existing.deletedAt) {
      throw new EntityNotFoundException('Anomalia de lectura', id);
    }

    const { lecturaId, ...rest } = updateDto;
    const dataToUpdate: UpdateReadingAnomalyRepositoryData = {
      ...rest,
      ...(lecturaId !== undefined && {
        lecturaId: this.validateLecturaId(lecturaId),
      }),
    };

    return this.readingAnomalyRepository.update(
      { anomaliaId: id },
      dataToUpdate,
    );
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
