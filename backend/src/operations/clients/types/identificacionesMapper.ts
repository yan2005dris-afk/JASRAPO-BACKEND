import type { IResponseIdentificacion } from './IResponseIdentificacion';

/**
 * Tipo de entrada desde Prisma
 */
export type IdentificacionPrismaRaw = {
  identificacionId: bigint;
  codigo: string;
  nombre: string;
  activo: boolean;
  orden: number;
};

/**
 * Mapea resultado de Prisma a DTO de response
 */
export function toIdentificacionResponse(
  identificacion: IdentificacionPrismaRaw,
): IResponseIdentificacion {
  return {
    identificacionId: identificacion.identificacionId,
    codigo: identificacion.codigo,
    nombre: identificacion.nombre,
    activo: identificacion.activo,
    orden: identificacion.orden,
  };
}