import { Injectable } from '@nestjs/common';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';
import { OperatorRepository } from '../../domain/repositories/operator.repository';
import type { OperatorTask } from '../../domain/repositories/repository-types';

@Injectable()
export class GetOperatorTasksUseCase {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(
    operarioId: number,
    tipoRuta?: string,
  ): Promise<OperatorTask[]> {
    const activePeriod = await this.operatorRepository.findActivePeriod();

    if (!activePeriod) {
      throw new EntityNotFoundException('Periodo', 'ABIERTO');
    }

    return this.operatorRepository.findTasksByOperator(
      operarioId,
      activePeriod.periodoId,
      tipoRuta,
    );
  }
}