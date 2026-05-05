export interface EffectivePermission {
  resource: string;
  action: string;
}

export interface PermissionCondition {
  resource: string;
  action: string;
}

export interface MenuRecord {
  menuId: number;
  menuPadreId: number | null;
  nombre: string;
  ruta: string;
  icono: string | null;
  activo: boolean;
  createdAt?: Date | null;
}
