import { ApiProperty } from '@nestjs/swagger';

export class SimpleRoleEntity {
  @ApiProperty({ example: 1, description: 'ID único del rol' })
  rolId: number;

  @ApiProperty({ example: 'admin', description: 'Nombre descriptivo del rol' })
  nombre: string;

  constructor(partial?: Partial<SimpleRoleEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.nombre !== undefined && this.nombre !== null && this.nombre.trim() === '') {
      throw new Error('El nombre del rol no puede estar vacío');
    }
  }
}

export class RoleEntity extends SimpleRoleEntity {
  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación suave',
    nullable: true,
  })
  deletedAt: Date | null;

  constructor(partial?: Partial<RoleEntity>) {
    super(partial);
  }
}

export class RolePermissionPermisoEntity {
  @ApiProperty({ example: 1, description: 'ID único del permiso' })
  permisoId: number;

  @ApiProperty({
    example: 'usuarios',
    description: 'Nombre descriptivo del permiso',
  })
  nombre: string;

  @ApiProperty({
    example: 'Ver usuarios',
    description: 'Descripción del permiso',
    nullable: true,
  })
  descripcion: string | null;

  @ApiProperty({ example: 'usuarios', description: 'Recurso asociado' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  accion: string;
}

export class RolePermissionDetailsEntity {
  @ApiProperty({ example: 1, description: 'ID único del permiso del rol' })
  rolPermisoId: number;

  @ApiProperty({ example: 1, description: 'ID del rol' })
  rolId: number;

  @ApiProperty({ example: 1, description: 'ID del permiso' })
  permisoId: number;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación suave',
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiProperty({
    type: () => RolePermissionPermisoEntity,
    description: 'Detalles del permiso',
  })
  permiso: RolePermissionPermisoEntity;
}

export class RoleWithPermissionsEntity extends RoleEntity {
  @ApiProperty({
    type: [RolePermissionDetailsEntity],
    description: 'Permisos asignados al rol',
  })
  rolPermisos: RolePermissionDetailsEntity[];

  constructor(partial?: Partial<RoleWithPermissionsEntity>) {
    super(partial);
  }
}

export class RolePermissionAssignmentEntity {
  @ApiProperty({ example: 1, description: 'ID único del permiso del rol' })
  rolPermisoId: number;

  @ApiProperty({ example: 1, description: 'ID del rol' })
  rolId: number;

  @ApiProperty({ example: 1, description: 'ID del permiso' })
  permisoId: number;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación suave',
    nullable: true,
  })
  deletedAt: Date | null;
}
