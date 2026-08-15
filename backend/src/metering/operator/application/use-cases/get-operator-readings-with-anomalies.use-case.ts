import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import type { ReadingWithAnomalies } from '../../domain/repositories/repository-types';

@Injectable()
export class GetOperatorReadingsWithAnomaliesUseCase {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(operarioId: number): Promise<ReadingWithAnomalies[]> {
    const activePeriod = await this.operatorRepository.findActivePeriod();

    if (!activePeriod) {
      throw new EntityNotFoundException('Periodo', 'ABIERTO');
    }

    return this.operatorRepository.findReadingsWithPendingAnomalies(
      operarioId,
      activePeriod.periodoId,
    );
  }
}