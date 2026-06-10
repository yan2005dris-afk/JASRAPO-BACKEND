import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsNumber,
  ValidateIf,
  IsEmail,
  IsBoolean,
  IsNotEmpty,
  Min,
  Length,
} from 'class-validator';

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
  @ValidateIf(
    (o) => o.tipoIdentificacionId !== 4, // CONSUMIDOR_FINAL tiene ID 4 en catálogo
  )
  @IsNotEmpty()
  @IsString()
  @Length(6, 20, {
    message: 'La identificación debe tener entre 6 y 20 caracteres',
  })
  identificacion?: string;

  @ValidateIf((o) => o.tipoIdentificacionId !== 4)
  @ApiPropertyOptional({ description: 'Nombres del cliente' })
  @ValidateIf((o) => o.tipoIdentificacionId !== 4)
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  nombres?: string;

  @ApiPropertyOptional()
  @ValidateIf((o) => o.tipoIdentificacionId !== 4)
  @IsNotEmpty()
  @IsString()
  apellidos?: string;

  @ApiPropertyOptional({
    description: 'Razón social (solo aplica para RUC)',
  })
  @ValidateIf((o) => o.tipoIdentificacionId === 1) // RUC tiene ID 1 en catálogo
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  @Length(2, 100)
  razonSocial?: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aplicaTerceraEdad?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  aplicaDiscapacidad?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 200)
  direccionDomicilio?: string;
}
