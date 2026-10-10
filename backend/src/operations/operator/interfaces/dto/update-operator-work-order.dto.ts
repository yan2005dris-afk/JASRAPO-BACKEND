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
  @Transform(({ value }) =>
    value === '' || value === undefined ? undefined : Number(value),
  )
  @IsLatitude()
  latitud?: number;

  @ApiPropertyOptional({
    description: 'Longitud GPS del operador al registrar la tarea',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === undefined ? undefined : Number(value),
  )
  @IsLongitude()
  longitud?: number;

  @ApiPropertyOptional({
    description: 'Lectura actual del medidor (para órdenes de LECTURA)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === undefined ? undefined : Number(value),
  )
  lecturaActual?: number;

  @ApiPropertyOptional({
    description: 'Lectura anterior de referencia (para órdenes de LECTURA)',
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === undefined ? undefined : Number(value),
  )
  lecturaAnterior?: number;

  @ApiPropertyOptional({
    description: 'Descripción de anomalía detectada durante la lectura',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  descripcionAnomalia?: string;

  @ApiPropertyOptional({
    description: 'Fecha efectiva de la toma de lectura',
    format: 'date-time',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  fechaLectura?: string;
}
