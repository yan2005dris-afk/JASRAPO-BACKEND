import { Injectable } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { PaymentRepository } from '../../domain/repositories/payment.repository';
import type {
  DailyCashSummaryParams,
  DailyCashSummaryResult,
} from '../../domain/types/payment.types';

@Injectable()
export class GetDailyCashSummaryUseCase {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(params: DailyCashSummaryParams): Promise<DailyCashSummaryResult> {
    const fecha = params.fecha ?? new Date().toISOString().split('T')[0];
    const fechaInicio = new Date(`${fecha}T00:00:00.000Z`);
    const fechaFin = new Date(`${fecha}T23:59:59.999Z`);
    const cajaId = params.cajaId ? BigInt(params.cajaId) : undefined;

    const pagos = await this.paymentRepository.findDailyCashPayments({
      fechaInicio,
      fechaFin,
      cajaId,
    });

    let total = new Decimal(0);
    const porTipoDetalle = new Map<string, Decimal>();
    const porTipoComprobante = new Map<string, Decimal>();

    for (const pago of pagos) {
      total = total.plus(pago.montoTotalRecibido);
      for (const detalle of pago.detallePago ?? []) {
        const monto = new Decimal(detalle.montoAbonado);
        porTipoDetalle.set(
          detalle.tipoPago,
          (porTipoDetalle.get(detalle.tipoPago) ?? new Decimal(0)).plus(monto),
        );

        const tipoComprobante =
          detalle.comprobante?.tipoComprobante ?? 'SIN_COMPROBANTE';
        porTipoComprobante.set(
          tipoComprobante,
          (porTipoComprobante.get(tipoComprobante) ?? new Decimal(0)).plus(
            monto,
          ),
        );
      }
    }

    return {
      fecha,
      cajaId: params.cajaId ?? null,
      totalPagos: pagos.length,
      totalRecaudado: total.toNumber(),
      desglosePorTipoDetalle: Array.from(porTipoDetalle.entries()).map(
        ([codigo, subtotal]) => ({
          codigo,
          total: subtotal.toNumber(),
        }),
      ),
      desglosePorTipoComprobante: Array.from(porTipoComprobante.entries()).map(
        ([codigo, subtotal]) => ({
          codigo,
          total: subtotal.toNumber(),
        }),
      ),
    };
  }
}
