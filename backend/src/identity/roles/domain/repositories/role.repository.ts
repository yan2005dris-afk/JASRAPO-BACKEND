export abstract class RoleRepository {
  abstract findUnique(rolId: number): Promise<any>;
  abstract findFirstAssignment(rolId: number, permisoId: number): Promise<any>;
  abstract findPermission(permisoId: number): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract create(nombre: string): Promise<any>;
  abstract update(rolId: number, data: any): Promise<any>;
  abstract assignPermission(rolId: number, permisoId: number): Promise<any>;
  abstract updateAssignment(rolPermisoId: number, data: any): Promise<any>;
  abstract syncSequence(): Promise<void>;
}
