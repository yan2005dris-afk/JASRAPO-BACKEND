import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class RemoveContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: bigint): Promise<ContractEntity> {
    const registro = await this.contractRepository.findById(id);
    if (!registro) {
      throw new EntityNotFoundException('Contrato', id.toString());
    }
    return this.contractRepository.softDelete(id);
  }
}
