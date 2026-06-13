import {
  IsOptional,
  IsInt,
  IsString,
  Matches,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class FindAllPrefacturasDto extends PaginationDto {
  @ApiPropertyOptional({
    description: 'Filtrar por ID de lote',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  loteId?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de periodo',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodoId?: number;

  @ApiPropertyOptional({
    description:
      'Filtrar por estado (GENERADA, EN_REVISION, APROBADA, RECHAZADA, ANULADA, PAGADA)',
    example: 'GENERADA',
  })
  @IsOptional()
  @IsString()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por ID de contrato',
    example: '1',
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d+$/, { message: 'contratoId debe ser un valor numérico' })
  contratoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por identificación del cliente',
    example: '1234567890',
  })
  @IsOptional()
  @IsString()
  identificacion?: string;
}
