/**
 * Re-export canonico de `MenuRow` para los consumidores de dominio.
 *
 * Antes existia `MenuRecord = MenuEntity` (type alias a la clase
 * anemica, eliminada en #366 Nivel 2). Ahora `MenuRow` es el row
 * Prisma directo, declarado en `infrastructure/repositories/menu.include.ts`.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar la firma del re-export.
 */
export type { MenuRow } from '../../infrastructure/repositories/menu.include';

export interface EffectivePermission {
  recurso: string;
  accion: string;
}

export interface PermissionCondition {
  recurso: string;
  accion: string;
}
