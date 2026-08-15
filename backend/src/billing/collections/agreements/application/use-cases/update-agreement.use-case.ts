import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { AgreementRepository } from '../../domain/repositories/agreement.repository';
import { safeAgreementWithInstallmentsSelect } from '../../infrastructure/repositories/prisma-agreement.repository';

/**
 * Actualiza el estado de un convenio.
 *
 * Casos especiales:
 * - PAGADO: marca el convenio como pagado, todas las cuotas PENDIENTE
 *   pasan a PAGADA con fecha de pago = hoy, saldoPendiente = 0,
 *   montoPagadoActual = deudaTotal, fechaProximoPago = null
 * - ANULADO: soft-delete (mismo comportamiento que DELETE)
 * - ACTIVO: aprueba el convenio (PREPARADO/PENDIENTE_ABONO → ACTIVO)
 */
@Injectable()
export class UpdateAgreementUseCase {
  constructor(private readonly agreementRepository: AgreementRepository) {}

  async execute(convenioId: bigint, nuevoEstado: string) {
    // ── 1. Validar que el convenio existe y no está borrado ──────────────────
    const convenio = await this.agreementRepository.findFirstConvenio(
      { convenioId, deletedAt: null },
      { convenioId: true, estado: true, deudaTotal: true },
    );

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
        return this.ejecutarPago(convenioId, convenio.deudaTotal);
      case 'ANULADO':
        return this.ejecutarAnulacion(convenioId);
      case 'ACTIVO':
        return this.ejecutarActivacion(convenioId);
      default:
        throw new BadRequestException(
          `Transición a ${nuevoEstado} no soportada`,
        );
    }
  }

  /**
   * Marca el convenio como PAGADO:
   * - Todas las cuotas PENDIENTE → PAGADA con fecha de pago hoy
   * - montoPagadoActual = deudaTotal
   * - fechaProximoPago = null
   * - estado = PAGADO
   */
  private async ejecutarPago(convenioId: bigint, deudaTotal: Decimal) {
    const hoy = new Date();

    return this.agreementRepository.executeTransaction(async (tx) => {
      // Traer cuotas pendientes con su valor para actualizarlas una por una
      const cuotasPendientes = await tx.cuotaConvenio.findMany({
        where: { convenioId, estado: 'PENDIENTE', deletedAt: null },
        select: { cuotaConvenioId: true, valorCuota: true },
      });

      for (const cuota of cuotasPendientes) {
        await tx.cuotaConvenio.update({
          where: { cuotaConvenioId: cuota.cuotaConvenioId },
          data: {
            estado: 'PAGADA',
            fechaPago: hoy,
            montoPagado: cuota.valorCuota,
            saldoPendiente: 0,
            pagoCompleto: true,
            diasRetraso: 0,
          },
        });
      }

      // Actualizar el convenio como pagado
      return tx.convenios.update({
        where: { convenioId },
        data: {
          estado: 'PAGADO',
          fechaProximoPago: null,
          montoPagadoActual: deudaTotal,
        },
        select: safeAgreementWithInstallmentsSelect,
      });
    });
  }

  /**
   * Marca el convenio como ANULADO (soft delete).
   */
  private async ejecutarAnulacion(convenioId: bigint) {
    return this.agreementRepository.updateConvenio(
      { convenioId },
      {
        estado: 'ANULADO',
        deletedAt: new Date(),
      },
      safeAgreementWithInstallmentsSelect,
    );
  }

  /**
   * Activa el convenio (PREPARADO/PENDIENTE_ABONO → ACTIVO).
   * Fija fechaAprobacion si no tenía.
   */
  private async ejecutarActivacion(convenioId: bigint) {
    const convenio = await this.agreementRepository.findFirstConvenio(
      { convenioId },
      { fechaAprobacion: true },
    );

    return this.agreementRepository.updateConvenio(
      { convenioId },
      {
        estado: 'ACTIVO',
        fechaAprobacion: convenio?.fechaAprobacion ?? new Date(),
      },
      safeAgreementWithInstallmentsSelect,
    );
  }
}
