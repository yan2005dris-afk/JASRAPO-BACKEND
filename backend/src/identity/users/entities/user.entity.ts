import { ApiProperty } from '@nestjs/swagger';

export class RoleEntity {
  @ApiProperty({ example: 1, description: 'ID único del rol' })
  rolId: number;

  @ApiProperty({ example: 'admin', description: 'Nombre descriptivo del rol' })
  nombre: string;
}

export class AuthPermissionEntity {
  @ApiProperty({ example: 'users', description: 'Nombre del recurso' })
  resource: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  action: string;
}

export class DirectPermissionEntity {
  @ApiProperty({ example: 1, description: 'ID de la relación usuario-permiso' })
  usuarioPermisoId: number;

  @ApiProperty({ example: 1, description: 'ID del permiso' })
  permisoId: number;

  @ApiProperty({ example: 'users', description: 'Recurso' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción' })
  accion: string;

  @ApiProperty({ example: true, description: 'Si está permitido o denegado' })
  permitido: boolean;
}

export class UserProfileEntity {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  usuarioId: number;

  @ApiProperty({ example: 'usuario@jasrapo.com', description: 'Correo electrónico' })
  email: string;

  @ApiProperty({ example: 'Juan Pérez', description: 'Nombre completo concatenado', nullable: true })
  name: string | null;

  @ApiProperty({ example: '+5491155555555', description: 'Número de teléfono', nullable: true })
  phone: string | null;

  @ApiProperty({ 
    example: { url: 'avatars/profile.png', key: 'profile.png' }, 
    description: 'Datos del avatar (JSON)', 
    nullable: true 
  })
  avatar: any | null;

  @ApiProperty({ type: () => RoleEntity, description: 'Rol asignado al usuario', nullable: true })
  role: RoleEntity | null;
}

export class UserEntity {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  usuarioId: number;

  @ApiProperty({ example: 'usuario@jasrapo.com', description: 'Correo electrónico' })
  email: string;

  @ApiProperty({ example: 'Juan', description: 'Nombres del usuario', nullable: true })
  nombres: string | null;

  @ApiProperty({ example: 'Pérez', description: 'Apellidos del usuario', nullable: true })
  apellidos: string | null;

  @ApiProperty({ example: '+5491155555555', description: 'Teléfono', nullable: true })
  telefono: string | null;

  @ApiProperty({ 
    example: { url: 'avatars/profile.png', key: 'profile.png' }, 
    description: 'Datos del avatar (JSON)', 
    nullable: true 
  })
  avatar: any | null;

  @ApiProperty({ type: () => RoleEntity, description: 'Rol asignado', nullable: true })
  role: RoleEntity | null;
}

export class UserDetailEntity extends UserEntity {
  @ApiProperty({ type: [DirectPermissionEntity], description: 'Permisos asignados directamente' })
  directPermissions: DirectPermissionEntity[];

  @ApiProperty({ type: [AuthPermissionEntity], description: 'Permisos heredados por el rol' })
  rolePermissions: AuthPermissionEntity[];
}
