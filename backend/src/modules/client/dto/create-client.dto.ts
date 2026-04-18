import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  Length,
  IsEnum,
  ValidateIf,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
} from 'class-validator';
import { TipoIdentificacion } from 'src/generated/prisma/enums';

export class CreateClientDto {
  @ApiProperty({ enum: TipoIdentificacion })
  @IsEnum(TipoIdentificacion)
  tipoIdentificacion!: TipoIdentificacion;

  // =========================
  // IDENTIFICACIÓN
  // =========================
  @ApiPropertyOptional({
    description:
      'Identificación del cliente. Obligatorio para todos los tipos excepto CONSUMIDOR FINAL',
  })
  @ValidateIf(
    (o) => o.tipoIdentificacion !== TipoIdentificacion.CONSUMIDOR_FINAL,
  )
  @IsNotEmpty()
  @IsString()
  @Length(6, 20, {
    message: 'La identificación debe tener entre 6 y 20 caracteres',
  })
  identificacion?: string;

  @ValidateIf(
    (o) => o.tipoIdentificacion !== TipoIdentificacion.CONSUMIDOR_FINAL,
  )
  @ApiPropertyOptional({ description: 'Nombres del cliente' })
  @ValidateIf(
    (o) => o.tipoIdentificacion !== TipoIdentificacion.CONSUMIDOR_FINAL,
  )
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  nombres?: string;

  @ApiPropertyOptional()
  @ValidateIf(
    (o) => o.tipoIdentificacion !== TipoIdentificacion.CONSUMIDOR_FINAL,
  )
  @IsNotEmpty()
  @IsString()
  apellidos?: string;

  // =========================
  // RAZÓN SOCIAL (solo RUC)
  // =========================
  @ApiPropertyOptional({
    description: 'Razón social (solo aplica para RUC)',
  })
  @ValidateIf((o) => o.tipoIdentificacion === TipoIdentificacion.RUC)
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  razonSocial?: string;

  // =========================
  // CONTACTO
  // =========================
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(9, 10)
  telefono?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(9, 10)
  telefonoSecundario?: string;

  // =========================
  // BENEFICIOS
  // =========================
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aplicaTerceraEdadDiscapacidad?: boolean;

  // =========================
  // DIRECCIÓN
  // =========================
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 200)
  direccionDomicilio?: string;
}
