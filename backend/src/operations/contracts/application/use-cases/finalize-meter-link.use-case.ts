import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';

@Injectable()
export class FinalizeMeterLinkUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contratoId: bigint): Promise<any> {
    const registro = await this.contractRepository.findUnique({
      contratoId,
    });
    if (!registro) {
      throw new NotFoundException(
        `Contrato con ID ${contratoId} no encontrado`,
      );
    }

    return this.contractRepository.executeTransaction(async (tx) => {
      const activeLink = await tx.historialMedidores.findFirst({
        where: { contratoId, fechaHasta: null },
      });

      if (!activeLink) {
        throw new NotFoundException(
          'No hay un vínculo activo para este contrato',
        );
      }

      await tx.historialMedidores.update({
        where: { historialId: activeLink.historialId },
        data: { fechaHasta: new Date() },
      });

      return tx.medidores.findUnique({
        where: { medidorId: activeLink.medidorId },
      });
    });
  }
}
