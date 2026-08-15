import { ApiProperty } from '@nestjs/swagger';
import { TipoAnomalia, EstadoAnomalia } from 'src/shared/enums';

export class ReadingAnomalyEntity {
  @ApiProperty({ example: '1', description: 'ID de la anomalía' })
  anomaliaId: bigint;

  @ApiProperty({ example: '1', description: 'ID de la lectura asociada' })
  lecturaId: bigint;

  @ApiProperty({
    example: 'Vidrio empañado',
    description: 'Observación sobre la anomalía',
    nullable: true,
  })
  observacion: string | null;

  @ApiProperty({
    example: 'MEDIDOR_DANADO',
    enum: TipoAnomalia,
    description: 'Tipo de anomalía',
  })
  tipo: TipoAnomalia;

  @ApiProperty({
    example: 'REGISTRADA',
    enum: EstadoAnomalia,
    description: 'Estado de la anomalía',
  })
  estado: EstadoAnomalia;

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

  @ApiProperty({
    example: 'http://storage/photo.jpg',
    description: 'URL de la foto',
    nullable: true,
  })
  fotoUrl: string | null;

  // Relaciones opcionales del dominio
  lectura?: {
    lecturaId: bigint;
    fecha: Date;
    lecturaActual: number;
    consumoCalculado: number;
  } | null;

  constructor(partial?: Partial<ReadingAnomalyEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.tipo === undefined || this.tipo === null) {
      throw new Error('El tipo de anomalía es obligatorio');
    }
  }

  resolve(): void {
    this.estado = EstadoAnomalia.RESUELTA;
  }
}
