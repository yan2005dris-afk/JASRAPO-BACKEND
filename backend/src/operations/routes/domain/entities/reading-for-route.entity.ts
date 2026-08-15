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

  constructor(partial?: Partial<ReadingForRouteEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.clienteNombre !== undefined && this.clienteNombre !== null && this.clienteNombre.trim() === '') {
      throw new Error('El nombre del cliente no puede estar vacío');
    }
  }
}
