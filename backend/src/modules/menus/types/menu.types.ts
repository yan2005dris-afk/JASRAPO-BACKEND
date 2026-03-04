export interface EffectivePermission {
  resource: string;
  action: string;
}

export interface PermissionCondition {
  resource: string;
  action: string;
}

export interface MenuRecord {
  menusId: number;
  menusParentId: number | null;
  name: string;
  route: string;
  icon: string | null;
  active: boolean;
  createdAt?: Date | null;
}
