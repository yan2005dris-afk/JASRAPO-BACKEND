import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default include para consultas de Prefacturas en Prisma.
 */
export const preInvoiceInclude = {
  prefacturaDetalle: {
    include: {
      rubro: {
        select: {
          nombre: true,
          codigoSistemaRubro: true,
        },
      },
    },
  },
  contrato: {
    select: {
      contratoId: true,
      numeroGuia: true,
      cliente: {
        select: {
          clienteId: true,
          nombres: true,
          apellidos: true,
          identificacion: true,
          direccionDomicilio: true,
          email: true,
        },
      },
    },
  },
  lote: {
    select: {
      loteId: true,
      estado: true,
      comunidad: { select: { nombre: true } },
    },
  },
  periodoRel: {
    select: { nombre: true, fechaInicio: true, fechaFin: true },
  },
  puntoEmision: {
    select: {
      id: true,
      codigo: true,
      establecimiento: {
        select: {
          id: true,
          codigo: true,
          emisor: {
            select: {
              id: true,
              ruc: true,
              razonSocial: true,
            },
          },
        },
      },
    },
  },
} as const satisfies Prisma.PrefacturasInclude;

export type PreInvoiceRow = Prisma.PrefacturasGetPayload<{
  include: typeof preInvoiceInclude;
}>;

export type PreInvoiceDetailRow = PreInvoiceRow['prefacturaDetalle'][number];
