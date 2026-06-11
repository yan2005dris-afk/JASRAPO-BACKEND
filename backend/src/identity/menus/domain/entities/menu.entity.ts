import { ApiProperty } from '@nestjs/swagger';

export class MenuEntity {
  @ApiProperty({ example: 1, description: 'ID único del menú' })
  menuId: number;

  @ApiProperty({ example: null, description: 'ID del menú padre', nullable: true })
  menuPadreId: number | null;

  @ApiProperty({ example: 'Suministro', description: 'Nombre descriptivo del menú' })
  nombre: string;

  @ApiProperty({ example: '/suministro', description: 'Ruta de acceso en el frontend' })
  ruta: string;

  @ApiProperty({ example: 'water_drop', description: 'Nombre del ícono', nullable: true })
  icono: string | null;

  @ApiProperty({ example: true, description: 'Estado activo o inactivo' })
  activo: boolean;

  @ApiProperty({ example: '2026-06-11T00:00:00.000Z', description: 'Fecha de creación', nullable: true })
  createdAt?: Date | null;
}
