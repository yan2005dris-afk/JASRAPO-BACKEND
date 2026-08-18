import {
  IsOptional,
  IsInt,
  IsString,
  IsIn,
  Matches,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class FindAllPreInvoicesDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filter by batch ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  loteId?: number;

  @ApiPropertyOptional({
    description: 'Filter by period ID',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodoId?: number;

  @ApiPropertyOptional({
    description:
      'Filter by status (GENERATED, IN_REVIEW, APPROVED, REJECTED, VOIDED, PAID)',
    example: 'GENERATED',
  })
  @IsOptional()
  @IsString()
  @IsIn([
    'GENERADA',
    'EN_REVISION',
    'APROBADA',
    'RECHAZADA',
    'ANULADA',
    'PAGADA',
  ])
  estado?: string;

  @ApiPropertyOptional({
    description: 'Filter by contract ID',
    example: '1',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'contratoId must be a numeric value' })
  contratoId?: string;

  @ApiPropertyOptional({
    description: 'Filter by client identification',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  identificacion?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date from (ISO or yyyy-MM-dd)',
    example: '2026-08-01',
  })
  @IsOptional()
  @IsString()
  fechaDesde?: string;

  @ApiPropertyOptional({
    description: 'Filter by creation date until (ISO or yyyy-MM-dd)',
    example: '2026-08-31',
  })
  @IsOptional()
  @IsString()
  fechaHasta?: string;
}
