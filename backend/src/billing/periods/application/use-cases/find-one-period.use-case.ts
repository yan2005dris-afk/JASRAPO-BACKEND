import { Injectable } from '@nestjs/common';
import { PeriodRepository } from '../../domain/repositories/period.repository';
import type { PeriodRow } from '../../domain/types/period.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOnePeriodUseCase {
  constructor(private readonly periodRepository: PeriodRepository) {}

  async execute(id: number): Promise<PeriodRow> {
    const period = await this.periodRepository.findById(id);
    if (!period) {
      throw new EntityNotFoundException('Periodo', id);
    }
    return period;
  }
}
