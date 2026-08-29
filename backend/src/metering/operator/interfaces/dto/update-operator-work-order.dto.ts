import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoOrdenTrabajo } from 'src/shared/enums';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

const multipartBoolean = ({ value }: { value: unknown }) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

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
  @IsDateString()
  completadoEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  estadoSellos?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(multipartBoolean)
  @IsBoolean()
  hayFugas?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(multipartBoolean)
  @IsBoolean()
  confirmacionRetiroSello?: boolean;
}
