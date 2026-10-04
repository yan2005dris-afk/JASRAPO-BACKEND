import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' ? undefined : value;

const multipartNumber = ({ value }: { value: unknown }) =>
  value === '' || value === undefined ? undefined : Number(value);

const multipartBoolean = ({ value }: { value: unknown }) => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
};

/** Fields an operator may edit; storage keys and administrative fields are excluded. */
export class UpdateOperatorReadingDto {
  @ApiPropertyOptional({
    description: 'Fecha de la lectura',
    format: 'date-time',
  })
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsDateString()
  fecha?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(multipartNumber)
  @IsNumber()
  lecturaAnterior?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(multipartNumber)
  @IsNumber()
  lecturaActual?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(emptyToUndefined)
  @IsString()
  @IsNotEmptyString()
  descripcionAnomalia?: string;
}
