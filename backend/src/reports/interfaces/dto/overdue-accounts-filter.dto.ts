import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseReportFilterDto } from './base-report-filter.dto';

export class OverdueAccountsFilterDto extends BaseReportFilterDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de contrato específico',
    example: '12',
  })
  @IsOptional()
  @IsString()
  contratoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de cliente específico',
    example: '5',
  })
  @IsOptional()
  @IsString()
  clienteId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de sector',
    example: '1',
  })
  @IsOptional()
  @IsString()
  sectorId?: string;

  @ApiPropertyOptional({
    description: 'Fecha de corte para calcular morosidad (YYYY-MM-DD)',
    example: '2026-08-31',
  })
  @IsOptional()
  @IsDateString()
  fechaCorte?: string;
}
