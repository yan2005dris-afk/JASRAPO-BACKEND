import { ApiProperty } from '@nestjs/swagger';
import type { RoleRow, RolPermisoRow } from '../../domain/types/role.types';

export class RolePermissionDetailResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID único de la asignación rol-permiso',
  })
  rolPermisoId: number;

  @ApiProperty({ example: 1, description: 'ID del permiso' })
  permisoId: number;

  @ApiProperty({
    example: 'Consultar Clientes',
    description: 'Nombre del permiso',
  })
  nombre: string;

  @ApiProperty({
    example: 'Permite consultar clientes',
    description: 'Descripción del permiso',
  })
  descripcion: string;

  @ApiProperty({ example: 'clientes', description: 'Nombre del recurso' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  accion: string;
}

export class RoleResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del rol' })
  rolId: number;

  @ApiProperty({
    example: 'Administrador',
    description: 'Nombre descriptivo del rol',
  })
  nombre: string;

  static fromRow(role: RoleRow): RoleResponseDto {
    const dto = new RoleResponseDto();
    dto.rolId = role.rolId;
    dto.nombre = role.nombre;
    return dto;
  }
}

export class RoleDetailResponseDto extends RoleResponseDto {
  @ApiProperty({
    type: [RolePermissionDetailResponseDto],
    description: 'Lista de permisos asignados al rol',
  })
  permisos: RolePermissionDetailResponseDto[];

  static fromRow(role: RoleRow): RoleDetailResponseDto {
    const dto = new RoleDetailResponseDto();
    dto.rolId = role.rolId;
    dto.nombre = role.nombre;
    dto.permisos = (role.rolPermisos || []).map((rp: RolPermisoRow) => ({
      rolPermisoId: rp.rolPermisoId,
      permisoId: rp.permisoId,
      nombre: rp.permiso?.nombre || '',
      descripcion: rp.permiso?.descripcion || '',
      recurso: rp.permiso?.recurso || '',
      accion: rp.permiso?.accion || '',
    }));
    return dto;
  }
}
