import { ApiProperty } from '@nestjs/swagger';

export class RouteEntity {
  @ApiProperty()
  rutaId: bigint;

  @ApiProperty()
  nombre: string;

  @ApiProperty({ required: false })
  descripcion?: string;

  @ApiProperty()
  operarioId: number;

  @ApiProperty()
  tipoRuta: string;

  @ApiProperty()
  comunidadId: number;

  @ApiProperty({ required: false })
  sectorId?: number;

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

  constructor(data: any) {
    this.rutaId = data.rutaId;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion ?? null;
    this.operarioId = data.operarioId;
    this.tipoRuta = data.tipoRuta;
    this.comunidadId = data.comunidadId;
    this.sectorId = data.sectorId ?? null;
    this.periodoId = data.periodoId ?? null;
    this.estado = data.estado;
    this.fechaPlanificada = data.fechaPlanificada;
    this.fechaInicio = data.fechaInicio;
    this.fechaFin = data.fechaFin;
  }
}
