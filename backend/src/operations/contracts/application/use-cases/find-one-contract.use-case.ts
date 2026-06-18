import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';

@Injectable()
export class FindOneContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: bigint): Promise<any> {
    const registro = await this.contractRepository.findUnique({
      contratoId: id,
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }
    return registro;
  }
}
