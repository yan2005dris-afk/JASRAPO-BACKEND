import type { RolePermission } from '../types/role.types';

export type { RolePermission };

export class RoleEntity {
  rolId: number;
  nombre: string;
  deletedAt: Date | null;
  rolPermisos?: RolePermission[];

  constructor(partial?: Partial<RoleEntity>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
