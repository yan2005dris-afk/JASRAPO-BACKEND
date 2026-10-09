/**
 * Re-export canonico de `CommunityRow` para los consumidores de dominio.
 *
 * El tipo se declara en `infrastructure/repositories/community.include.ts`
 * (donde vive `communityInclude`, el detalle Prisma), pero el dominio
 * consume `CommunityRow` desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { CommunityRow } from '../../infrastructure/repositories/community.include';

export interface CommunityFilters {
  codigo?: string;
  nombre?: string;
  search?: string;
  activo?: boolean;
}

export interface CreateCommunityData {
  codigo: string;
  nombre: string;
  descripcion?: string | null;
  porcentajeTasaSeguridad?: number | null;
  activo?: boolean;
}

export interface UpdateCommunityData {
  codigo?: string;
  nombre?: string;
  descripcion?: string | null;
  porcentajeTasaSeguridad?: number | null;
  activo?: boolean;
  deletedAt?: Date | null;
}
