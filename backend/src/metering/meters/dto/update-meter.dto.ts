import { PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { EstadoMedidor } from 'src/generated/prisma/client';
import { CreateMeterDto } from './create-meter.dto';

export class UpdateMeterDto extends PartialType(CreateMeterDto) {
  @IsOptional()
  @IsEnum(EstadoMedidor)
  estado?: EstadoMedidor;

  @IsOptional()
  @IsString()
  fechaInstalacion: string | Date;

  @IsOptional()
  @IsDateString()
  fechaBaja?: string | Date;

  @IsOptional()
  @IsString()
  motivo?: string;

  @IsOptional()
  @IsNumber()
  latitud?: number;

  @IsOptional()
  @IsNumber()
  longitud?: number;
}
