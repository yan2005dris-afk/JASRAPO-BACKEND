import { ApiProperty } from '@nestjs/swagger';

export class RoleEntity {
  @ApiProperty({ example: 1, description: 'ID único del rol' })
  rolId: number;

  @ApiProperty({ example: 'admin', description: 'Nombre descriptivo del rol' })
  nombre: string;
}

export class AuthPermissionEntity {
  @ApiProperty({ example: 'users', description: 'Nombre del recurso' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  accion: string;
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

export class AvatarEntity {
  @ApiProperty({
    example: 'https://example.com/avatar.png',
    description: 'URL de acceso a la imagen',
  })
  url: string;

  @ApiProperty({
    example: 'profile-photos/user-1.png',
    description: 'Key del archivo en el storage',
    required: false,
  })
  key?: string;
}

export class UserProfileEntity {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  usuarioId: number;

  @ApiProperty({
    example: 'usuario@jasrapo.com',
    description: 'Correo electrónico',
  })
  email: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre completo concatenado',
    nullable: true,
  })
  nombre: string | null;

  @ApiProperty({
    example: '+593991234567',
    description: 'Número de teléfono (formato Ecuador)',
    nullable: true,
  })
  telefono: string | null;

  @ApiProperty({
    type: () => AvatarEntity,
    description: 'Datos del avatar',
    nullable: true,
  })
  avatar: AvatarEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
    description: 'Rol asignado al usuario',
    nullable: true,
  })
  rol: RoleEntity | null;
  constructor(partial?: Partial<UserProfileEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.email !== undefined && this.email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        throw new Error('El formato del correo electrónico es inválido');
      }
    }

    if (
      this.telefono !== undefined &&
      this.telefono !== null &&
      this.telefono.trim() !== ''
    ) {
      const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
      if (!phoneRegex.test(this.telefono)) {
        throw new Error('El formato del teléfono es inválido');
      }
    }
  }
}

export class UserEntity {
  @ApiProperty({ example: 1, description: 'ID único del usuario' })
  usuarioId: number;

  @ApiProperty({
    example: 'usuario@jasrapo.com',
    description: 'Correo electrónico',
  })
  email: string;

  @ApiProperty({
    example: 'Juan',
    description: 'Nombres del usuario',
    nullable: true,
  })
  nombres: string | null;

  @ApiProperty({
    example: 'Pérez',
    description: 'Apellidos del usuario',
    nullable: true,
  })
  apellidos: string | null;

  @ApiProperty({
    example: '+593991234567',
    description: 'Teléfono (formato Ecuador)',
    nullable: true,
  })
  telefono: string | null;

  @ApiProperty({
    type: () => AvatarEntity,
    description: 'Datos del avatar',
    nullable: true,
  })
  avatar: AvatarEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
    description: 'Rol asignado',
    nullable: true,
  })
  rol: RoleEntity | null;

  constructor(partial?: Partial<UserEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  static create(props: Partial<UserEntity>): UserEntity {
    return new UserEntity(props);
  }

  validateInvariants(): void {
    if (this.email !== undefined && this.email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        throw new Error('El formato del correo electrónico es inválido');
      }
    }

    if (
      this.telefono !== undefined &&
      this.telefono !== null &&
      this.telefono.trim() !== ''
    ) {
      const phoneRegex = /^\+?[0-9\s\-]{7,15}$/;
      if (!phoneRegex.test(this.telefono)) {
        throw new Error('El formato del teléfono es inválido');
      }
    }
  }

  changeRole(newRol: RoleEntity | null): void {
    this.rol = newRol;
  }

  updateProfile(
    nombres?: string | null,
    apellidos?: string | null,
    telefono?: string | null,
  ): void {
    if (nombres !== undefined) this.nombres = nombres;
    if (apellidos !== undefined) this.apellidos = apellidos;
    if (telefono !== undefined) this.telefono = telefono;
    this.validateInvariants();
  }

  updateEmail(newEmail: string): void {
    this.email = newEmail;
    this.validateInvariants();
  }

  getNombreCompleto(): string {
    return [this.nombres, this.apellidos].filter(Boolean).join(' ');
  }
}

export class UserDetailEntity extends UserEntity {
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

  constructor(partial?: Partial<UserDetailEntity>) {
    super(partial);
  }
}
