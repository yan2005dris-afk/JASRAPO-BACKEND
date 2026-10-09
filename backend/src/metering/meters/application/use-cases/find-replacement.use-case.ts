import { Injectable } from '@nestjs/common';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import type { ReemplazoMedidorRow } from '../../infrastructure/repositories/meter.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindReplacementUseCase {
  constructor(private readonly meterRepository: MeterRepository) {}

  async execute(reemplazoId: bigint): Promise<ReemplazoMedidorRow> {
    const reemplazo =
      await this.meterRepository.findReplacementById(reemplazoId);
    if (!reemplazo || reemplazo.deletedAt) {
      throw new EntityNotFoundException('Reemplazo de medidor', reemplazoId);
    }
    return reemplazo;
  }
}
