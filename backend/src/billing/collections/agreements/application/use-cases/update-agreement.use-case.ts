import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import type { AgreementRow } from '../../domain/types/agreement.types';

@Injectable()
export class UpdateAgreementUseCase {
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(
    convenioId: bigint,
    nuevoEstado: string,
  ): Promise<AgreementRow> {
    // ── 1. Validar que el convenio existe y no está borrado ──────────────────
    const convenio = await this.agreementRepository.findById(convenioId);

    if (!convenio) {
      throw new NotFoundException(
        `Convenio con ID ${convenioId} no encontrado`,
      );
    }

    // ── 2. Validar transiciones válidas ──────────────────────────────────────
    const estadoActual = convenio.estado;

    if (estadoActual === nuevoEstado) {
      throw new BadRequestException(
        `El convenio ya se encuentra en estado ${nuevoEstado}`,
      );
    }

    if (estadoActual === 'PAGADO' || estadoActual === 'ANULADO') {
      throw new BadRequestException(
        `No se puede cambiar el estado de un convenio ${estadoActual}`,
      );
    }

    // ── 3. Ejecutar la transición ────────────────────────────────────────────
    switch (nuevoEstado) {
      case 'PAGADO':
        return this.agreementRepository.markAsPaid(convenioId);
      case 'ANULADO':
        return this.agreementRepository.updateState(convenioId, 'ANULADO', {
          deletedAt: new Date(),
        });
      case 'ACTIVO':
        return this.agreementRepository.updateState(convenioId, 'ACTIVO', {
          fechaAprobacion: convenio.fechaAprobacion ?? new Date(),
        });
      default:
        throw new BadRequestException(
          `Transición a ${nuevoEstado} no soportada`,
        );
    }
  }
}
