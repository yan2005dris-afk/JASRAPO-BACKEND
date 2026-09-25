import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class BaseReportFilterDto {
  @ApiPropertyOptional({
    description: 'Formato de salida (csv | xlsx | pdf | json)',
    enum: ['csv', 'xlsx', 'pdf', 'json'],
  })
  @IsOptional()
  @IsString()
  @IsIn(['csv', 'xlsx', 'pdf', 'json'], {
    message: 'El formato debe ser csv, xlsx, pdf o json',
  })
  format?: 'csv' | 'xlsx' | 'pdf' | 'json';
}
