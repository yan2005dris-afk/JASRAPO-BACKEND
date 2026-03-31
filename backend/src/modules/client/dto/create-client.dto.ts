import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Length, IsEnum, ValidateIf, IsEmail, IsBoolean } from 'class-validator';
import { TipoIdentificacion } from 'src/generated/prisma/enums';

export class CreateClientDto {
  @ApiProperty({enum: TipoIdentificacion})
  @IsEnum(TipoIdentificacion)
  tipoIdentificacion: TipoIdentificacion;

  @ApiPropertyOptional({
    description: 'Identificación del cliente. Obligatorio para todos los tipos excepto CONSUMIDOR FINAL',
  })
  @ValidateIf((o) => o.tipoIdentificacion !== 'CONSUMIDOR_FINAL')
  @IsString()
  @Length(6, 20, {
    message: 'La identificación debe tener entre 6 y 20 caracteres',
  })
  identificacion?:string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 50, { message: 'El nombre debe tener entre 2 y 50 caracteres' })
  nombres?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(2, 50)
  apellidos?: string;

  @ApiPropertyOptional()
  @IsOptional()
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
  aplicaTerceraEdadDiscapacidad?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(5, 200)
  direccionDomicilio?: string;
}
