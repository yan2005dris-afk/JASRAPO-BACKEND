import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaymentsReportFilterDto {
  @ApiPropertyOptional({ description: 'Fecha inicio del rango (ISO date string, e.g. 2024-01-01)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaDesde?: string;

  @ApiPropertyOptional({ description: 'Fecha fin del rango (ISO date string, e.g. 2024-12-31)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  fechaHasta?: string;

  @ApiPropertyOptional({ description: 'ID del cliente (BigInt como string)' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  clienteId?: string;
}
