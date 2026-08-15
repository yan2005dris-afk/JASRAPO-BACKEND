import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FinalizeMeterLinkUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contratoId: bigint): Promise<ContractEntity> {
    const registro = await this.contractRepository.findById(contratoId);
    if (!registro) {
      throw new EntityNotFoundException('Contrato', contratoId.toString());
    }

    return this.contractRepository.finalizeActiveMeterLink(contratoId);
  }
}
