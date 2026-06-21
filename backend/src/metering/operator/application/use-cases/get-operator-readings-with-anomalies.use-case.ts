import { Injectable, NotFoundException } from '@nestjs/common';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

@Injectable()
export class GetOperatorReadingsWithAnomaliesUseCase {
  constructor(private readonly operatorRepository: OperatorRepository) {}

  async execute(operarioId: number): Promise<any[]> {
    const activePeriod = await this.operatorRepository.findActivePeriod();

    if (!activePeriod) {
      throw new NotFoundException(
        'No hay un período de facturación ABIERTO en el sistema',
      );
    }

    return this.operatorRepository.findReadingsWithPendingAnomalies(
      operarioId,
      activePeriod.periodoId,
    );
  }
}
