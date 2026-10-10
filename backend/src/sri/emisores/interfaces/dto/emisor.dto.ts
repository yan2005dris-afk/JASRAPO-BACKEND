import {
  IsString,
  IsOptional,
  IsBoolean,
  Length,
  Matches,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';

export class CreateEmisorDto {
  @ApiProperty({ description: 'RUC del emisor (13 dígitos)' })
  @IsString()
  @Length(13, 13)
  @Matches(/^\d{13}$/, { message: 'El RUC debe tener 13 dígitos' })
  ruc: string;

  @ApiProperty({ description: 'Razón social' })
  @IsNotEmptyString()
  @MaxLength(300)
  razonSocial: string;

  @ApiPropertyOptional({ description: 'Nombre comercial' })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(300)
  nombreComercial?: string;

  @ApiProperty({ description: 'Dirección matriz' })
  @IsNotEmptyString()
  @MaxLength(300)
  direccionMatriz: string;

  @ApiPropertyOptional({ description: 'Obligado a llevar contabilidad' })
  @IsOptional()
  @IsBoolean()
  obligadoContabilidad?: boolean;

  @ApiPropertyOptional({ description: 'Número de contribuyente especial' })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(20)
  contribuyenteEspecial?: string;

  @ApiPropertyOptional({ description: 'Código de agente de retención' })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(20)
  agenteRetencion?: string;

  @ApiPropertyOptional({ description: 'Es contribuyente RIMPE' })
  @IsOptional()
  @IsBoolean()
  contribuyenteRimpe?: boolean;

  @ApiPropertyOptional({
    description: 'Ambiente SRI: 1/pruebas o 2/produccion',
  })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(1)
  ambiente?: string;
}

export class UpdateEmisorDto {
  @ApiPropertyOptional({ description: 'Razón social' })
  @IsOptional()
  @IsString()
  razonSocial?: string;

  @ApiPropertyOptional({ description: 'Nombre comercial' })
  @IsOptional()
  @IsString()
  nombreComercial?: string;

  @ApiPropertyOptional({ description: 'Dirección matriz' })
  @IsOptional()
  @IsString()
  direccionMatriz?: string;

  @ApiPropertyOptional({ description: 'Obligado a llevar contabilidad' })
  @IsOptional()
  @IsBoolean()
  obligadoContabilidad?: boolean;

  @ApiPropertyOptional({ description: 'Número de contribuyente especial' })
  @IsOptional()
  @IsString()
  contribuyenteEspecial?: string;

  @ApiPropertyOptional({ description: 'Código de agente de retención' })
  @IsOptional()
  @IsString()
  agenteRetencion?: string;

  @ApiPropertyOptional({ description: 'Es contribuyente RIMPE' })
  @IsOptional()
  @IsBoolean()
  contribuyenteRimpe?: boolean;

  @ApiPropertyOptional({
    description: 'Ambiente SRI: 1/pruebas o 2/produccion',
  })
  @IsOptional()
  @IsString()
  ambiente?: string;

  @ApiPropertyOptional({ description: 'Estado: ACTIVO o INACTIVO' })
  @IsOptional()
  @IsString()
  estado?: string;
}

export class EmisorResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  ruc: string;

  @ApiProperty()
  razonSocial: string;

  @ApiPropertyOptional()
  nombreComercial?: string;

  @ApiProperty()
  direccionMatriz: string;

  @ApiProperty()
  obligadoContabilidad: boolean;

  @ApiPropertyOptional()
  contribuyenteEspecial?: string;

  @ApiPropertyOptional()
  agenteRetencion?: string;

  @ApiProperty()
  contribuyenteRimpe: boolean;

  @ApiProperty()
  ambiente: string;

  @ApiProperty()
  estado: string;

  @ApiProperty()
  tieneCertificado: boolean;

  @ApiPropertyOptional()
  certificadoValidoHasta?: string;

  @ApiPropertyOptional()
  certificadoSujeto?: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

export class UploadCertificadoDto {
  @ApiProperty({ description: 'Contraseña del certificado P12' })
  @IsNotEmptyString()
  @MaxLength(128)
  password: string;
}

export class CreateEstablecimientoDto {
  @ApiProperty({
    description: 'Código SRI del establecimiento (ej: 001, 002)',
    example: '001',
  })
  @IsNotEmptyString()
  @Length(3, 3)
  codigo: string;

  @ApiProperty({
    description: 'Dirección física de la sucursal/establecimiento',
    example: 'Calle Principal Olón',
  })
  @IsNotEmptyString()
  @MaxLength(300)
  direccion: string;
}

export class CreatePuntoEmisionDto {
  @ApiProperty({
    description: 'Código SRI del punto de emisión / caja (ej: 001, 002)',
    example: '001',
  })
  @IsNotEmptyString()
  @Length(3, 3)
  codigo: string;

  @ApiPropertyOptional({
    description: 'Descripción o nombre de la caja/ventanilla',
    example: 'Ventanilla 1 - Cobros',
  })
  @IsOptional()
  @IsString()
  descripcion?: string;
}
