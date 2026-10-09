import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en cada query del repositorio de Pagos.
 *
 * Trae 3 relations:
 * - `cliente` con `select` limitado a 8 campos (lo que necesita el
 *   mapper para poblar `cliente: {...}` en el entity anemico).
 * - `detallePago` con `where: { deletedAt: null }`, `orderBy: createdAt`,
 *   y un include nested de `comprobante` con `select` de 5 campos +
 *   `prefactura` con `select` de 4 campos + `periodoRel.nombre`.
 * - `saldosFavor` con `where: { deletedAt: null }`, `orderBy: createdAt desc`.
 */
export const paymentInclude = {
  cliente: {
    select: {
      clienteId: true,
      nombres: true,
      apellidos: true,
      razonSocial: true,
      identificacion: true,
      email: true,
      telefono: true,
      direccionDomicilio: true,
    },
  },
  detallePago: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'asc' as const },
    include: {
      comprobante: {
        select: {
          id: true,
          tipoComprobante: true,
          secuencial: true,
          importeTotal: true,
          estado: true,
          prefactura: {
            select: {
              prefacturaId: true,
              mes: true,
              totalPagar: true,
              consumoM3: true,
              periodoRel: {
                select: {
                  nombre: true,
                },
              },
            },
          },
        },
      },
    },
  },
  saldosFavor: {
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' as const },
  },
} as const satisfies Prisma.PagosInclude;

/**
 * Tipo de fila Prisma para Pago con el include por defecto. Reemplaza
 * al brand `PaymentRow` (eliminado en #366 Nivel 2).
 */
export type PaymentRow = Prisma.PagosGetPayload<{
  include: typeof paymentInclude;
}>;

/**
 * Tipo derivado del campo `detallePago` del row Pago. Reemplaza al
 * brand `PaymentDetailRow` (y su interface `ComprobantePaymentRef`).
 */
export type PaymentDetailRow = PaymentRow['detallePago'][number];

/**
 * Tipo derivado del campo `saldosFavor` del row Pago. Reemplaza al
 * brand `SaldoFavorRow`.
 */
export type SaldoFavorRow = PaymentRow['saldosFavor'][number];
