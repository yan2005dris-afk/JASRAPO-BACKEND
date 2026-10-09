import { Decimal } from 'decimal.js';
import type { AgreementRow } from '../infrastructure/repositories/agreement.include';

/**
 * Factory para construir filas `AgreementRow` tipadas en specs.
 *
 * Reemplaza al `new AgreementEntity(...)` (que era `Object.assign(this, partial)`)
 * en specs del BC agreements. Cada override se pisa sobre defaults
 * sensatos. Si Prisma cambia la forma del modelo `Convenios`, el
 * factory lo detecta en compile-time.
 *
 * @example
 *   const row = agreementRow({ convenioId: 7n, estado: 'PAGADO' });
 *   prisma.convenios.findFirst.mockResolvedValue(row);
 */
export function agreementRow(
  overrides: Partial<AgreementRow> = {},
): AgreementRow {
  const base: AgreementRow = {
    convenioId: 1n,
    contratoId: 100n,
    numeroCuotas: 12,
    abonoInicial: new Decimal(100),
    deudaTotal: new Decimal(1200),
    mesesMoraActual: 0,
    estado: 'PENDIENTE_ABONO',
    fechaAprobacion: null,
    fechaPrimerPago: new Date('2026-02-01T00:00:00.000Z'),
    fechaProximoPago: new Date('2026-02-01T00:00:00.000Z'),
    montoPagadoActual: new Decimal(0),
    motivo: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    deletedAt: null,
    cuotaConvenio: [],
    contrato: {
      numeroGuia: 'GUIA-100',
      cliente: {
        nombres: 'María',
        apellidos: 'Pérez',
        razonSocial: null,
        identificacion: '1105123456',
        email: 'maria@ejemplo.com',
      },
    },
  };

  return { ...base, ...overrides };
}
