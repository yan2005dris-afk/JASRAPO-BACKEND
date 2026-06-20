import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class ConnectionHistoryFilterDto {
  @ApiProperty({ description: 'ID del contrato (BigInt como string)' })
  @IsNotEmptyString()
  @MaxLength(50)
  @Type(() => String)
  contratoId: string;

  @ApiPropertyOptional({
    description: 'Fecha inicio del rango (ISO date string)',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha fin del rango (ISO date string)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaHasta?: string;
}
