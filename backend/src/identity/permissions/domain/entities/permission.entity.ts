import { ApiProperty } from '@nestjs/swagger';

export class PermissionEntity {
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
  })
  descripcion: string;

  @ApiProperty({ example: 'usuarios', description: 'Recurso asociado' })
  recurso: string;

  @ApiProperty({ example: 'read', description: 'Acción permitida' })
  accion: string;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación suave',
    nullable: true,
  })
  deletedAt: Date | null;

  constructor(partial?: Partial<PermissionEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.recurso !== undefined && this.recurso !== null && this.recurso.trim() === '') {
      throw new Error('El recurso del permiso no puede estar vacío');
    }
    if (this.accion !== undefined && this.accion !== null && this.accion.trim() === '') {
      throw new Error('La acción del permiso no puede estar vacía');
    }
  }
}
