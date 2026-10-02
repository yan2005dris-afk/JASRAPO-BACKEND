import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  ValidateIf,
  IsEmail,
  IsBoolean,
  IsDateString,
  Min,
  Max,
  Length,
  MaxLength,
} from 'class-validator';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
import { IsPastDate } from 'src/infrastructure/common/decorators/is-past-date.decorator';

/** IDs del catálogo `catalogo_tipos_identificacion` */
const CATALOGO = {
  RUC: 1,
  CEDULA: 2,
  PASAPORTE: 3,
  CONSUMIDOR_FINAL: 4,
  IDENTIFICACION_EXTERIOR: 5,
} as const;

export class CreateClientDto {
  @ApiProperty({
    description: 'ID del tipo de identificación del catálogo',
    example: 1,
  })
  @IsNumber()
  @Min(1)
  tipoIdentificacionId!: number;

  @ApiPropertyOptional({
    description:
      'Identificación del cliente. Obligatorio para todos los tipos excepto CONSUMIDOR FINAL',
  })
  @ValidateIf((o) => o.tipoIdentificacionId !== CATALOGO.CONSUMIDOR_FINAL)
  @IsNotEmptyString()
  @Length(6, 20, {
    message: 'La identificación debe tener entre 6 y 20 caracteres',
  })
  identificacion?: string;

  @ApiProperty({ description: 'Nombres del cliente (obligatorio)' })
  @ValidateIf((o) => o.tipoIdentificacionId !== CATALOGO.CONSUMIDOR_FINAL)
  @IsNotEmptyString()
  @MaxLength(100)
  nombres?: string;

  @ApiProperty({ description: 'Apellidos del cliente (obligatorio)' })
  @ValidateIf((o) => o.tipoIdentificacionId !== CATALOGO.CONSUMIDOR_FINAL)
  @IsNotEmptyString()
  @MaxLength(100)
  apellidos?: string;

  @ApiProperty({
    description: 'Razón social (obligatoria para RUC)',
  })
  @ValidateIf((o) => o.tipoIdentificacionId === CATALOGO.RUC)
  @IsNotEmptyString({ message: 'La razón social es obligatoria para RUC' })
  @Length(2, 100)
  razonSocial?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmptyString()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmptyString()
  @Length(9, 10)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNotEmptyString()
  @Length(9, 10)
  telefonoSecundario?: string;

  @ApiPropertyOptional({
    description:
      'Fecha de nacimiento (ISO). Se usa para calcular automáticamente el beneficio de tercera edad; no se persiste.',
    example: '1955-04-20',
  })
  @IsOptional()
  @IsDateString()
  @IsPastDate({ message: 'La fecha de nacimiento debe estar en el pasado' })
  fechaNacimiento?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aplicaDiscapacidad?: boolean;

  @ApiPropertyOptional({
    description:
      'Porcentaje del carné de discapacidad. Obligatorio cuando aplicaDiscapacidad es true.',
    example: 50,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(1)
  @Max(100)
  porcentajeDiscapacidad?: number;

  @ApiProperty({
    description:
      'Dirección del domicilio (obligatoria para facturación, excepto Consumidor Final)',
  })
  @ValidateIf((o) => o.tipoIdentificacionId !== CATALOGO.CONSUMIDOR_FINAL)
  @IsNotEmptyString({
    message: 'La dirección de domicilio es obligatoria para facturación',
  })
  @Length(5, 200)
  direccionDomicilio?: string;
}
