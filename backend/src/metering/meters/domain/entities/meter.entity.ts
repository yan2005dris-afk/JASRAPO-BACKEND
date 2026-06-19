import { ApiProperty } from '@nestjs/swagger';
import { EstadoMedidor } from 'src/shared/enums';

export class MeterEntity {
  @ApiProperty({ example: '1', description: 'ID del medidor' })
  medidorId: bigint;

  @ApiProperty({ example: 'Itron', description: 'Marca del medidor' })
  marca: string;

  @ApiProperty({ example: 'CX1000', description: 'Modelo del medidor' })
  modelo: string;

  @ApiProperty({
    example: 'SN-2024-001234',
    description: 'Número de serie del medidor',
  })
  serie: string;

  @ApiProperty({
    example: 'BODEGA',
    enum: EstadoMedidor,
    description: 'Estado del medidor',
  })
  estado: EstadoMedidor;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de instalación',
    nullable: true,
  })
  fechaInstalacion: Date | null;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de baja',
    nullable: true,
  })
  fechaBaja: Date | null;

  @ApiProperty({
    example: 'Cambio por daño',
    description: 'Motivo de baja',
    nullable: true,
  })
  motivo: string | null;

  @ApiProperty({
    example: -33.4489,
    description: 'Latitud geográfica',
    nullable: true,
  })
  latitud: number | null;

  @ApiProperty({
    example: -70.6693,
    description: 'Longitud geográfica',
    nullable: true,
  })
  longitud: number | null;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: Date;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de eliminación lógica',
    nullable: true,
  })
  deletedAt: Date | null;

  constructor(partial: Partial<MeterEntity>) {
    Object.assign(this, partial);
  }
}
