import type { IResponseIdentificacion } from './IResponseIdentificacion';
import type { CatalogoTiposIdentificacion } from 'src/generated/prisma/client';

/**
 * Tipo de entrada desde Prisma
 */
export type IdentificacionPrismaRaw = Pick<
  CatalogoTiposIdentificacion,
  'id' | 'codigo' | 'descripcion' | 'activo'
>;

/**
 * Mapea resultado de Prisma a DTO de response
 */
export function toIdentificacionResponse(
  identificacion: IdentificacionPrismaRaw,
): IResponseIdentificacion {
  return {
    id: identificacion.id,
    codigo: identificacion.codigo,
    descripcion: identificacion.descripcion,
    activo: identificacion.activo,
  };
}
