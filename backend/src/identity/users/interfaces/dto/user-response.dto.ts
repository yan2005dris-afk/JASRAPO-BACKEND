import { ApiProperty } from '@nestjs/swagger';
import {
  RoleEntity,
  AvatarEntity,
  DirectPermissionEntity,
  AuthPermissionEntity,
} from '../../domain/entities/user.entity';

export class UserProfileResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  usuarioId: number;

  @ApiProperty({
    example: 'usuario@jasrapo.com',
    description: 'Correo electrónico',
  })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo',
    nullable: true,
  })
  nombre: string | null;

  @ApiProperty({
    example: '+593991234567',
    description: 'Teléfono',
    nullable: true,
  })
  telefono: string | null;

  @ApiProperty({
    type: () => AvatarEntity,
    description: 'Avatar',
    nullable: true,
  })
  avatar: AvatarEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
    description: 'Rol asignado',
    nullable: true,
  })
  rol: RoleEntity | null;
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
    type: () => AvatarEntity,
    description: 'Avatar',
    nullable: true,
  })
  avatar: AvatarEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
    description: 'Rol asignado',
    nullable: true,
  })
  rol: RoleEntity | null;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación',
    nullable: true,
    required: false,
  })
  deletedAt?: Date | null;
}

export class UserDetailResponseDto extends UserResponseDto {
  @ApiProperty({
    type: [DirectPermissionEntity],
    description: 'Permisos asignados directamente',
  })
  permisosDirectos: DirectPermissionEntity[];

  @ApiProperty({
    type: [AuthPermissionEntity],
    description: 'Permisos heredados por el rol',
  })
  permisosRol: AuthPermissionEntity[];
}
