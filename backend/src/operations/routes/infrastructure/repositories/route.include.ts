import type { Prisma } from 'src/generated/prisma/client';

export const routeInclude = {
  tipoActividad: {
    select: { codigo: true },
  },
} satisfies Prisma.RutasInclude;

export type RouteRow = Prisma.RutasGetPayload<{
  include: typeof routeInclude;
}>;

export const ordenTrabajoInclude = {
  ruta: {
    include: {
      tipoActividad: {
        select: { codigo: true },
      },
    },
  },
  contrato: {
    select: {
      numeroGuia: true,
      direccionSuministro: true,
      cliente: {
        select: {
          nombres: true,
          apellidos: true,
        },
      },
    },
  },
  medidor: {
    select: {
      serie: true,
    },
  },
  lectura: {
    select: {
      lecturaId: true,
    },
  },
} satisfies Prisma.OrdenesTrabajoInclude;

export type OrdenTrabajoRow = Prisma.OrdenesTrabajoGetPayload<{
  include: typeof ordenTrabajoInclude;
}>;

export const readingForRouteInclude = {
  medidor: {
    include: {
      historial: {
        where: { fechaHasta: null },
        include: {
          contrato: {
            include: {
              cliente: true,
              sector: true,
            },
          },
        },
      },
    },
  },
} satisfies Prisma.LecturasInclude;

export type ReadingForRouteRow = Prisma.LecturasGetPayload<{
  include: typeof readingForRouteInclude;
}>;
