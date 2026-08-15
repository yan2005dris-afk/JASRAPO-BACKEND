import { ApiProperty } from '@nestjs/swagger';

export class RouteEntity {
  @ApiProperty()
  rutaId: bigint;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false, nullable: true })
  descripcion?: string | null;

  @ApiProperty()
  operarioId: number;

  @ApiProperty()
  tipoRuta: string;

  @ApiProperty()
  comunidadId: number;

  @ApiProperty({ required: false, nullable: true })
  sectorId?: number | null;

  @ApiProperty({ required: false, nullable: true })
  periodoId: number | null;

  @ApiProperty()
  estado: string;

  @ApiProperty({
    required: false,
    nullable: true,
    example: '2025-05-12T10:30:00.000Z',
  })
  fechaPlanificada: string | null;

  @ApiProperty({ required: false, nullable: true })
  fechaInicio: string | null;

  @ApiProperty({ required: false, nullable: true })
  fechaFin: string | null;

  constructor(partial?: Partial<RouteEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.nombre !== undefined && this.nombre !== null && this.nombre.trim() === '') {
      throw new Error('El nombre de la ruta no puede estar vacío');
    }
    if (this.operarioId !== undefined && this.operarioId <= 0) {
      throw new Error('El ID de operario debe ser mayor a cero');
    }
  }
}
