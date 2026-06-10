import { Injectable } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';

@Injectable()
export class FinalizeMeterLinkUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(medidorId: bigint): Promise<any> {
    return this.contractRepository.executeTransaction(async (tx) => {
      await tx.historialMedidores.updateMany({
        where: { medidorId, fechaHasta: null },
        data: { fechaHasta: new Date() },
      });
      return tx.medidores.findUnique({ where: { medidorId } });
    });
  }
}
