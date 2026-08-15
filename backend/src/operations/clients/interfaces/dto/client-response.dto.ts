import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TipoIdentificacionResponseDto {
  @ApiProperty({ example: 1, description: 'ID del tipo de identificación' })
  id: number;

  @ApiProperty({ example: '05', description: 'Código SRI' })
  codigo: string;

  @ApiProperty({ example: 'CEDULA', description: 'Descripción' })
  descripcion: string;
}

export class ClientResponseDto {
  @ApiProperty({ example: '1', description: 'ID único del cliente' })
  clienteId: bigint;

  @ApiProperty({
    example: '1712345678',
    description: 'Número de identificación',
  })
  identificacion: string;

  @ApiProperty({ example: 'Juan', description: 'Nombres del cliente' })
  nombres: string;

  @ApiProperty({ example: 'Pérez', description: 'Apellidos del cliente' })
  apellidos: string;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Razón social',
  })
  razonSocial: string | null;

  @ApiPropertyOptional({
    example: 'juan@example.com',
    nullable: true,
    description: 'Correo electrónico',
  })
  email: string | null;

  @ApiPropertyOptional({
    example: '+593991234567',
    nullable: true,
    description: 'Teléfono principal',
  })
  telefono: string | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Teléfono secundario',
  })
  telefonoSecundario: string | null;

  @ApiPropertyOptional({
    example: 'Av. Amazonas y Colón',
    nullable: true,
    description: 'Dirección de domicilio',
  })
  direccionDomicilio: string | null;

  @ApiProperty({ example: true, description: 'Estado activo o inactivo' })
  activo: boolean;

  @ApiProperty({
    example: false,
    description: 'Si aplica tarifa de discapacidad',
  })
  aplicaDiscapacidad: boolean;

  @ApiProperty({
    example: false,
    description: 'Si aplica tarifa de tercera edad',
  })
  aplicaTerceraEdad: boolean;

  @ApiPropertyOptional({
    type: TipoIdentificacionResponseDto,
    nullable: true,
    description: 'Tipo de identificación',
  })
  tipoIdentificacion: TipoIdentificacionResponseDto | null;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    description: 'Fecha de eliminación',
  })
  deletedAt?: Date | null;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2026-06-11T00:00:00.000Z',
    description: 'Fecha de actualización',
  })
  updatedAt: Date;
}
