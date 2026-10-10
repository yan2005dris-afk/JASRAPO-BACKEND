import type { Prisma } from 'src/generated/prisma/client';

/**
 * Default Prisma include usado en las queries de novedades del operario.
 *
 * Trae la orden de trabajo con contrato (cliente), medidor (serie) y ruta
 * (comunidad/sector). El servicio de aplicación proyecta este row al shape
 * de respuesta sin tocar Prisma.
 */
export const operatorNoveltyInclude = {
  ordenTrabajo: {
    select: {
      contratoId: true,
      medidorId: true,
      medidor: { select: { serie: true } },
      contrato: {
        select: {
          numeroGuia: true,
          direccionSuministro: true,
          cliente: {
            select: { nombres: true, apellidos: true, razonSocial: true },
          },
        },
      },
      ruta: {
        select: {
          comunidadId: true,
          sectorId: true,
          comunidad: { select: { nombre: true } },
          sector: { select: { nombre: true } },
        },
      },
    },
  },
} as const satisfies Prisma.NovedadOrdenTrabajoInclude;

/**
 * Tipo de fila Prisma que el repositorio retorna.
 */
export type OperatorNoveltyRow = Prisma.NovedadOrdenTrabajoGetPayload<{
  include: typeof operatorNoveltyInclude;
}>;
