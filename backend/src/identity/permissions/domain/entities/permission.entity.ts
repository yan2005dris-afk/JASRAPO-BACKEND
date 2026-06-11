import { ApiProperty } from '@nestjs/swagger';

export class PermissionEntity {
  @ApiProperty({ example: 1, description: 'ID único del permiso' })
  permisoId: number;

  @ApiProperty({ example: 'usuarios', description: 'Nombre descriptivo del permiso' })
  nombre: string;

  @ApiProperty({ example: 'Ver usuarios', description: 'Descripción del permiso' })
  descripcion: string;

  @ApiProperty({ example: 'usuarios', description: 'Recurso asociado' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  accion: string;

  @ApiProperty({ example: null, description: 'Fecha de eliminación suave', nullable: true })
  deletedAt: Date | null;
}
