import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class ConnectionHistoryFilterDto {
  @ApiProperty({ description: 'ID del contrato (BigInt como string)' })
  @IsNotEmpty()
  @IsString()
  @Type(() => String)
  contratoId: string;

  @ApiPropertyOptional({ description: 'Fecha inicio del rango (ISO date string)' })
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
