import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoOrdenTrabajo } from 'src/shared/enums';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

export class UpdateOperatorWorkOrderDto {
  @ApiPropertyOptional({ enum: EstadoOrdenTrabajo })
  @IsOptional()
  @IsEnum(EstadoOrdenTrabajo)
  estado?: EstadoOrdenTrabajo;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  resultadoObservacion?: string;

  @ApiPropertyOptional({ description: 'ISO-8601 completion timestamp' })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  completadoEn?: string;

  @ApiPropertyOptional({
    description: 'Latitud GPS del operador al registrar la tarea',
  })
  @IsOptional()
  @IsLatitude()
  latitud?: number;

  @ApiPropertyOptional({
    description: 'Longitud GPS del operador al registrar la tarea',
  })
  @IsOptional()
  @IsLongitude()
  longitud?: number;
}
