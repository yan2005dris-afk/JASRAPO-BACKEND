/**
 * Tipos de input/salida del dominio del BC sectors.
 *
 * Antes vivian en `domain/entities/sector.entity.ts` junto a la clase
 * anemica `SectorEntity` (eliminada en #366 Nivel 2). Ahora la "entity"
 * es el tipo de fila Prisma `SectorRow`, asi que los tipos de I/O quedan
 * solos aca.
 */

/**
 * Re-export canonico de `SectorRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/sector.include.ts`
 * (donde vive `sectorInclude`, que es el detalle Prisma), pero los
 * consumidores de dominio/application/interfaces lo importan desde aca.
 *
 * Esto preserva la inversion de dependencias: el dominio no importa
 * nada de `infrastructure/` directamente. Si en el futuro se cambia el
 * ORM, este es el unico archivo del BC a migrar la firma del re-export.
 */
export type { SectorRow } from '../../infrastructure/repositories/sector.include';

/**
 * Referencia minima a una comunidad usada por el repositorio.
 * No incluye todos los campos del modelo `Comunidades`, solo los que el
 * BC sectors expone hacia afuera.
 */
export interface ComunidadRef {
  comunidadId: number;
  codigo: string;
  nombre: string;
}

export interface SectorFilters {
  codigo?: string;
  nombre?: string;
  comunidadId?: number;
  search?: string;
}

export interface CreateSectorData {
  codigo: string;
  nombre: string;
  comunidadId: number;
}

export interface UpdateSectorData {
  nombre?: string;
  comunidadId?: number;
}
