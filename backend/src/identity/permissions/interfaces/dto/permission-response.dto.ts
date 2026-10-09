import { ApiProperty } from '@nestjs/swagger';
import type { PermissionRow } from '../../domain/types/permission.types';

export class PermissionResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del permiso' })
  permisoId: number;

  @ApiProperty({
    example: 'Consultar Usuarios',
    description: 'Nombre del permiso',
  })
  nombre: string;

  @ApiProperty({
    example: 'Permite consultar usuarios',
    description: 'Descripción del permiso',
  })
  descripcion: string;

  @ApiProperty({ example: 'users', description: 'Nombre del recurso' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  accion: string;

  static fromRow(permission: PermissionRow): PermissionResponseDto {
    const dto = new PermissionResponseDto();
    dto.permisoId = permission.permisoId;
    dto.nombre = permission.nombre;
    dto.descripcion = permission.descripcion;
    dto.recurso = permission.recurso;
    dto.accion = permission.accion;
    return dto;
  }
}
