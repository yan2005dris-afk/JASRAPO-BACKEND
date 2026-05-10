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

  @ApiProperty()
  estado: string;

  @ApiProperty({ required: false })
  fechaPlanificada?: Date;

  @ApiProperty({ required: false })
  fechaInicio?: Date;

  @ApiProperty({ required: false })
  fechaFin?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(data: any) {
    this.rutaId = data.rutaId;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.operarioId = data.operarioId;
    this.tipoRuta = data.tipoRuta;
    this.comunidadId = data.comunidadId;
    this.sectorId = data.sectorId;
    this.estado = data.estado;
    this.fechaPlanificada = data.fechaPlanificada;
    this.fechaInicio = data.fechaInicio;
    this.fechaFin = data.fechaFin;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}
