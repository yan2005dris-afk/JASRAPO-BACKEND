import type { RoleRow, RolPermisoRow } from '../types/role.types';
import type { UpdateRoleRepositoryData } from '../types/role.types';

export abstract class RoleRepository {
  abstract findUnique(rolId: number): Promise<RoleRow | null>;
  abstract findByName(nombre: string): Promise<RoleRow | null>;
  abstract findFirstAssignment(
    rolId: number,
    permisoId: number,
  ): Promise<RolPermisoRow | null>;
  abstract findPermission(permisoId: number): Promise<{
    permisoId: number;
    nombre: string;
    deletedAt: Date | null;
  } | null>;
  abstract findAll(skip?: number, take?: number): Promise<RoleRow[]>;
  abstract count(params?: { where?: Record<string, any> }): Promise<number>;
  abstract create(nombre: string): Promise<RoleRow>;
  abstract update(
    rolId: number,
    data: UpdateRoleRepositoryData,
  ): Promise<RoleRow>;
  abstract assignPermission(
    rolId: number,
    permisoId: number,
  ): Promise<RolPermisoRow>;
  abstract updateAssignment(
    rolPermisoId: number,
    data: { deletedAt?: Date | null },
  ): Promise<RolPermisoRow>;
  abstract syncSequence(): Promise<void>;
}
