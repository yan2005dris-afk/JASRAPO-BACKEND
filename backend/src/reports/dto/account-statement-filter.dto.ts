import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, Matches } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class AccountStatementFilterDto {
  @ApiProperty({ description: 'ID del contrato (BigInt como string)' })
  @IsNotEmptyString()
  @MaxLength(50)
  @Matches(/^[1-9]\d*$/, {
    message: 'contratoId must be a positive integer',
  })
  @Type(() => String)
  contratoId: string;

  @ApiPropertyOptional({
    description:
      'Fecha inicio del rango (ISO date string). Si no se envía, trae desde el período más antiguo.',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaDesde?: string;

  @ApiPropertyOptional({
    description:
      'Fecha fin del rango (ISO date string). Si no se envía, trae hasta el período más reciente.',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaHasta?: string;
}
