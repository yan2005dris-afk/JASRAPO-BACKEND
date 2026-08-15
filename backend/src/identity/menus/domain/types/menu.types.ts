import type { MenuEntity } from '../entities/menu.entity';

export interface EffectivePermission {
  recurso: string;
  accion: string;
}

export interface PermissionCondition {
  recurso: string;
  accion: string;
}

export type MenuRecord = MenuEntity;
