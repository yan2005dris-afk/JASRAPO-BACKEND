import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsNotEmptyString } from 'src/common/decorators/is-not-empty-string.decorator';
import { IsValidDateRange } from 'src/common/decorators/is-valid-date-range.decorator';
import { BaseReportFilterDto } from './base-report-filter.dto';

export class ConnectionHistoryFilterDto extends BaseReportFilterDto {
  @ApiProperty({ description: 'ID del contrato (BigInt como string)' })
  @IsNotEmptyString()
  @MaxLength(50)
  @Matches(/^[1-9]\d*$/, {
    message: 'contratoId must be a positive integer',
  })
  @Type(() => String)
  contratoId: string;

  @ApiPropertyOptional({
    description: 'Fecha inicio del rango (ISO date string)',
  })
  @IsOptional()
  @IsString()
  @IsValidDateRange()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha fin del rango (ISO date string)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaHasta?: string;
}
