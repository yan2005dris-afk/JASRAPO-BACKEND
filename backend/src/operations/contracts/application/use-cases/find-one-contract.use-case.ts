import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import type { ContractRow } from '../../infrastructure/repositories/contract.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: bigint): Promise<ContractRow> {
    const registro = await this.contractRepository.findById(id);
    if (!registro) {
      throw new EntityNotFoundException('Contrato', id.toString());
    }
    return registro;
  }
}
