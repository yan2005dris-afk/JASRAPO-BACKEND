import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';

@Injectable()
export class FinalizeMeterLinkUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contratoId: bigint): Promise<any> {
    const registro = await this.contractRepository.findUnique({
      contratoId,
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(
        `Contrato con ID ${contratoId} no encontrado`,
      );
    }

    return this.contractRepository.finalizeActiveMeterLink(contratoId);
  }
}
