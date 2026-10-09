import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import type { ContractRow } from '../../infrastructure/repositories/contract.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FinalizeMeterLinkUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contratoId: bigint): Promise<ContractRow> {
    const registro = await this.contractRepository.findById(contratoId);
    if (!registro) {
      throw new EntityNotFoundException('Contrato', contratoId.toString());
    }

    return this.contractRepository.finalizeActiveMeterLink(contratoId);
  }
}
