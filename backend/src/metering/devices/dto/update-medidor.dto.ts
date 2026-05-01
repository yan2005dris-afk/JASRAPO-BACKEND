import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoMedidor } from 'src/generated/prisma/client';

export class ActualizarMedidorDto {
  @IsOptional()
  @IsNumber()
  lecturaInicial?: number;

  @IsOptional()
  @IsString()
  marca?: string;

  @IsOptional()
  @IsString()
  modelo?: string;

  @IsOptional()
  @IsString()
  serie?: string;

  @IsOptional()
  @IsEnum(EstadoMedidor)
  estado?: EstadoMedidor;

  @IsOptional()
  @IsDateString()
  fechaBaja?: string | Date;

  @IsOptional()
  @IsString()
  motivoBaja?: string;
}
