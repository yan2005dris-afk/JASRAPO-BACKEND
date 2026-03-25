import { Type } from 'class-transformer';
import { IsInt, IsNumberString, IsOptional, IsString, Length, IsEnum } from 'class-validator';

export class CreateClientDto {
  @IsString()
  nombres: string;

  @IsString()
  apellidos: string;

  @IsNumberString()
  @Length(10, 10)
  identificacion: string;

  @IsOptional()
  @IsEnum(['CEDULA', 'RUC', 'PASAPORTE', 'CONSUMIDOR_FINAL', 'IDENTIFICACION_EXTRANJERA'])
  tipoIdentificacion?: 'CEDULA' | 'RUC' | 'PASAPORTE' | 'CONSUMIDOR_FINAL' | 'IDENTIFICACION_EXTRANJERA';

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  telefono?: string;

  @IsOptional()
  @IsString()
  telefonoSecundario?: string;

  @IsOptional()
  aplicaTerceraEdadDiscapacidad?: boolean;

  @IsOptional()
  @IsString()
  razonSocial?: string;

  @IsOptional()
  @IsString()
  direccionDomicilio?: string;
}
