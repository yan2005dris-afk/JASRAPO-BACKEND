import { Decimal } from 'decimal.js';
import type { CuotaConvenioRow } from '../infrastructure/repositories/agreement.include';

/**
 * Factory para construir filas `CuotaConvenioRow` tipadas en specs.
 *
 * Reemplaza al `new InstallmentEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC agreements. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `CuotaConvenio`, el
 * factory lo detecta en compile-time.
 *
 * @example
 *   const row = cuotaRow({ numeroCuota: 1, valorCuota: 100 });
 *   prisma.cuotaConvenio.findMany.mockResolvedValue([row]);
 */
export function cuotaRow(
  overrides: Partial<CuotaConvenioRow> = {},
): CuotaConvenioRow {
  const base: CuotaConvenioRow = {
    cuotaConvenioId: 1n,
    convenioId: 1n,
    numeroCuota: 1,
    valorCuota: new Decimal(100),
    saldoPendiente: new Decimal(100),
    fechaVencimiento: new Date('2026-02-01T00:00:00.000Z'),
    estado: 'PENDIENTE',
    fechaPago: null,
    montoPagado: new Decimal(0),
    diasRetraso: 0,
    interesMoraAplicado: new Decimal(0),
    pagoCompleto: false,
    fechaPagoAnticipado: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
  };

  return { ...base, ...overrides };
}
