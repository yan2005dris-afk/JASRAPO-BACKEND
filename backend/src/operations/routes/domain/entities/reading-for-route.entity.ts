import { ApiProperty } from '@nestjs/swagger';

export class ReadingForRouteEntity {
  @ApiProperty()
  lecturaId: bigint;

  @ApiProperty()
  guia: string;

  @ApiProperty()
  clienteNombre: string;

  @ApiProperty()
  direccion: string;

  @ApiProperty({ required: false })
  sector?: string;

  @ApiProperty()
  estadoContrato: string;

  constructor(data: any) {
    this.lecturaId = data.lecturaId;
    this.guia = data.guia;
    this.clienteNombre = data.clienteNombre;
    this.direccion = data.direccion;
    this.sector = data.sector;
    this.estadoContrato = data.estadoContrato;
  }
}
