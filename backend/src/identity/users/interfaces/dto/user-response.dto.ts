import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del rol' })
  rolId: number;

  @ApiProperty({ example: 'admin', description: 'Nombre descriptivo del rol' })
  nombre: string;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación suave del rol',
    nullable: true,
  })
  deletedAt?: Date | null;
}

export class AuthPermissionResponseDto {
  @ApiProperty({ example: 'users', description: 'Nombre del recurso' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  accion: string;
}

export class DirectPermissionResponseDto {
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

export class AvatarResponseDto {
  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'URL de acceso a la imagen',
  })
  url: string;

  @ApiPropertyOptional({
    example: 'profile-photos/user-1.png',
    description: 'Key del archivo en el storage',
  })
  key?: string;
}

export class UserResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  usuarioId: number;

  @ApiProperty({
    example: 'usuario@jasrapo.com',
    description: 'Correo electrónico',
  })
  email: string;

  @ApiProperty({ example: 'Juan', description: 'Nombres', nullable: true })
  nombres: string | null;

  @ApiProperty({ example: 'Pérez', description: 'Apellidos', nullable: true })
  apellidos: string | null;

  @ApiProperty({
    example: '+593991234567',
    description: 'Teléfono',
    nullable: true,
  })
  telefono: string | null;

  @ApiProperty({
    type: () => AvatarResponseDto,
    description: 'Avatar',
    nullable: true,
  })
  avatar: AvatarResponseDto | null;

  @ApiProperty({
    type: () => RoleResponseDto,
    description: 'Rol asignado',
    nullable: true,
  })
  rol: RoleResponseDto | null;

  @ApiPropertyOptional({
    example: null,
    description: 'Fecha de eliminación',
    nullable: true,
  })
  deletedAt?: Date | null;
}

export class UserProfileResponseDto extends OmitType(UserResponseDto, [
  'nombres',
  'apellidos',
  'deletedAt',
] as const) {
  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo del usuario',
    nullable: true,
  })
  nombre: string | null;
}

export class UserDetailResponseDto extends UserResponseDto {
  @ApiProperty({
    type: [DirectPermissionResponseDto],
    description: 'Permisos asignados directamente',
  })
  permisosDirectos: DirectPermissionResponseDto[];

  @ApiProperty({
    type: [AuthPermissionResponseDto],
    description: 'Permisos heredados por el rol',
  })
  permisosRol: AuthPermissionResponseDto[];
}
