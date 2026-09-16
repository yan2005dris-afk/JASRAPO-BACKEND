import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';
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
  @Transform(emptyToUndefined)
  @IsDateString()
  completadoEn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmptyString()
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
