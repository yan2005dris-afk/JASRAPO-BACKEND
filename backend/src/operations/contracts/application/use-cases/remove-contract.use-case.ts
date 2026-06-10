import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';

@Injectable()
export class RemoveContractUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(id: bigint): Promise<{ message: string }> {
    const registro = await this.contractRepository.findUnique({
      contratoId: id,
    });
    if (!registro || registro.deletedAt) {
      throw new NotFoundException(`Contrato con ID ${id} no encontrado`);
    }
    await this.contractRepository.update(
      { contratoId: id },
      { deletedAt: new Date() },
    );
    return { message: `Contrato con ID ${id} eliminado` };
  }
}
