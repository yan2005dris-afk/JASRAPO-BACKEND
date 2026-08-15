import type { RoleEntity, RolePermission } from '../entities/role.entity';

export type { RolePermission };

export abstract class RoleRepository {
  abstract findUnique(rolId: number): Promise<RoleEntity | null>;
  abstract findByName(nombre: string): Promise<RoleEntity | null>;
  abstract findFirstAssignment(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermission | null>;
  abstract findPermission(permisoId: number): Promise<{
    permisoId: number;
    nombre: string;
    deletedAt: Date | null;
  } | null>;
  abstract findAll(skip?: number, take?: number): Promise<RoleEntity[]>;
  abstract count(params?: { where?: Record<string, any> }): Promise<number>;
  abstract create(nombre: string): Promise<RoleEntity>;
  abstract update(
    rolId: number,
    data: { nombre?: string; deletedAt?: Date | null },
  ): Promise<RoleEntity>;
  abstract assignPermission(
    rolId: number,
    permisoId: number,
  ): Promise<RolePermission>;
  abstract updateAssignment(
    rolPermisoId: number,
    data: { deletedAt?: Date | null },
  ): Promise<RolePermission>;
  abstract syncSequence(): Promise<void>;
}
