import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { BaseReportFilterDto } from './base-report-filter.dto';

export class ZoneConsumptionFilterDto extends BaseReportFilterDto {
  @ApiPropertyOptional({
    description:
      'ID del periodo de facturación. Si se omite, se usa el más reciente CERRADO.',
    example: '7',
  })
  @IsOptional()
  @IsString()
  periodoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de comunidad',
    example: '2',
  })
  @IsOptional()
  @IsString()
  comunidadId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de sector',
    example: '1',
  })
  @IsOptional()
  @IsString()
  sectorId?: string;
}
