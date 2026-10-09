import type { Prisma } from 'src/generated/prisma/client';

export const meterInclude = {
  historial: {
    where: { fechaHasta: null },
    orderBy: { fechaDesde: 'desc' },
    take: 1,
    include: {
      contrato: {
        include: {
          cliente: true,
        },
      },
    },
  },
} satisfies Prisma.MedidoresInclude;

export type MeterRow = Prisma.MedidoresGetPayload<{
  include: typeof meterInclude;
}>;

export const meterHistoryInclude = {
  medidor: true,
  contrato: { include: { cliente: true } },
  reemplazosSaliente: { select: { reemplazoId: true } },
  reemplazosEntrante: { select: { reemplazoId: true } },
} satisfies Prisma.HistorialMedidoresInclude;

export type MeterHistoryRow = Prisma.HistorialMedidoresGetPayload<{
  include: typeof meterHistoryInclude;
}>;

export type ReemplazoMedidorRow = Prisma.ReemplazoMedidorGetPayload<object>;
