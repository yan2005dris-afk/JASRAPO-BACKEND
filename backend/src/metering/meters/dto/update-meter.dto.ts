import { PartialType } from '@nestjs/swagger';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { CreateMeterDto } from './create-meter.dto';

export class UpdateMeterDto extends PartialType(CreateMeterDto) {
  @IsOptional()
  @IsNumber()
  estadoId?: number;

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