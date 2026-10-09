/**
 * Tipos de input/salida del dominio del BC sectors.
 *
 * Antes vivian en `domain/entities/sector.entity.ts` junto a la clase
 * anemica `SectorEntity` (eliminada en #366 Nivel 2). Ahora la "entity"
 * es el tipo de fila Prisma `SectorRow`, asi que los tipos de I/O quedan
 * solos aca.
 */

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
