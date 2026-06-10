export abstract class PermissionRepository {
  abstract create(data: any): Promise<any>;
  abstract findAll(): Promise<any[]>;
  abstract findUnique(permisoId: number): Promise<any>;
  abstract update(permisoId: number, data: any): Promise<any>;
}
