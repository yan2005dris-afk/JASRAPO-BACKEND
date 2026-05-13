import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class TipoIdentificacionSnippet {
  @ApiProperty()
  identificacionId: number;

  @ApiProperty()
  codigo: string;

  @ApiProperty()
  nombre: string;
}

export class ClientEntity {
  @ApiProperty()
  clienteId: string;

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
}
