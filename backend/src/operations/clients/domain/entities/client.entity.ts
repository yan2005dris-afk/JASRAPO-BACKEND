import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TipoIdentificacionSnippet {
  @ApiProperty()
  id: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  descripcion: string;
}

export class ClientEntity {
  @ApiProperty()
  clienteId: bigint;

  @ApiProperty()
  identificacion: string;

  @ApiProperty()
  nombres: string;

  @ApiProperty()
  apellidos: string;

  @ApiPropertyOptional({ nullable: true })
  razonSocial: string | null;

  @ApiPropertyOptional({ nullable: true })
  email: string | null;

  @ApiPropertyOptional({ nullable: true })
  telefono: string | null;

  @ApiPropertyOptional({ nullable: true })
  telefonoSecundario: string | null;

  @ApiPropertyOptional({ nullable: true })
  direccionDomicilio: string | null;

  @ApiProperty()
  activo: boolean;

  @ApiProperty()
  aplicaDiscapacidad: boolean;

  @ApiProperty()
  aplicaTerceraEdad: boolean;

  @ApiPropertyOptional({ type: TipoIdentificacionSnippet, nullable: true })
  tipoIdentificacion: TipoIdentificacionSnippet | null;

  @ApiPropertyOptional({ nullable: true })
  deletedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  constructor(partial?: Partial<ClientEntity>) {
    if (partial) {
      Object.assign(this, partial);
      this.validateInvariants();
    }
  }

  validateInvariants(): void {
    if (this.identificacion !== undefined && this.identificacion !== null && this.identificacion.trim() === '') {
      throw new Error('La identificación del cliente no puede estar vacía');
    }
    if (this.email !== undefined && this.email !== null && this.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        throw new Error('El formato del correo electrónico del cliente es inválido');
      }
    }
  }

  getNombreCompleto(): string {
    return [this.nombres, this.apellidos].filter(Boolean).join(' ');
  }
}
