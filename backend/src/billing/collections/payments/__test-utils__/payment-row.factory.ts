import { Prisma } from 'src/generated/prisma/client';
import type {
  PaymentRow,
  PaymentDetailRow,
  SaldoFavorRow,
} from '../infrastructure/repositories/payment.include';

/**
 * Factory para construir filas `PaymentRow` tipadas en specs.
 *
 * Reemplaza al `new PaymentRow(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC billing/collections/payments. Cada override se pisa
 * sobre defaults sensatos. Si Prisma cambia la forma del modelo `Pagos`,
 * el factory lo detecta en compile-time.
 *
 * Por defecto, las 3 relations (cliente, detallePago, saldosFavor)
 * quedan como `null` (el `select: true` las trae, pero el contenido
 * depende del mock; sin override explicito, el row tiene `null`).
 * El caller puede overridear `detallePago: [detalleRow()]` o
 * `saldosFavor: [saldoFavorRow()]` para tests especificos.
 *
 * @example
 *   const row = paymentRow({ pagoId: 7n, estadoPago: 'CONFIRMADO' });
 *   prisma.pagos.findFirst.mockResolvedValue(row);
 */
export function paymentRow(overrides: Partial<PaymentRow> = {}): PaymentRow {
  const base: Partial<PaymentRow> = {
    pagoId: 1n,
    clienteId: 1n,
    cajaId: null,
    banco: null,
    tarjetaCredito: null,
    comprobanteUrl: null,
    fechaPago: new Date('2026-01-01T00:00:00.000Z'),
    montoTotalRecibido: new Prisma.Decimal(100),
    numeroOperacion: null,
    observaciones: null,
    referenciaBanco: null,
    estadoPago: 'REGISTRADO',
    creadoPor: 'admin',
    anuladoPor: null,
    fechaAnulacion: null,
    motivoAnulacion: null,
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    cliente: undefined,
    detallePago: [],
    saldosFavor: [],
  };

  return { ...base, ...overrides } as PaymentRow;
}

/**
 * Factory para construir filas `PaymentDetailRow` tipadas en specs.
 */
export function paymentDetailRow(
  overrides: Partial<PaymentDetailRow> = {},
): PaymentDetailRow {
  const base: Partial<PaymentDetailRow> = {
    detallePagoId: 1n,
    pagoId: 1n,
    comprobanteId: null,
    cuotaConvenioId: null,
    tipoPago: 'COMPROBANTE',
    montoAbonado: new Prisma.Decimal(50),
    formaPagoId: 1,
    referencia: null,
    fechaTransaccion: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    comprobante: null,
  };

  return { ...base, ...overrides } as PaymentDetailRow;
}

/**
 * Factory para construir filas `SaldoFavorRow` tipadas en specs.
 */
export function saldoFavorRow(
  overrides: Partial<SaldoFavorRow> = {},
): SaldoFavorRow {
  const base: Partial<SaldoFavorRow> = {
    saldoFavorId: 1n,
    clienteId: 1n,
    pagoId: null,
    montoSaldo: new Prisma.Decimal(50),
    tipoOrigen: 'PAGO_EXCESO',
    disponibleParaAplicar: true,
    deletedAt: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
  };

  return { ...base, ...overrides } as SaldoFavorRow;
}
