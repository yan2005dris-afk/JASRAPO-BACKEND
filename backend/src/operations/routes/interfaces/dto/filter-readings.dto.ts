import {
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaginationDto } from 'src/infrastructure/common/dtos/pagination.dto';

export class FilterReadingsDto extends PaginationDto {
  @ApiProperty({
    description: 'Tipo de ruta para filtrar lecturas elegibles',
    enum: ['TOMA_LECTURA', 'RECONEXION'],
  })
  @IsNotEmpty()
  @IsIn(['TOMA_LECTURA', 'RECONEXION'])
  tipoRuta!: 'TOMA_LECTURA' | 'RECONEXION';

  @ApiProperty({
    description: 'ID de la comunidad',
    example: 1,
  })
  @IsNotEmpty()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  comunidadId!: number;

  @ApiProperty({
    description: 'ID del sector (opcional)',
    required: false,
    example: 2,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  sectorId?: number;

  @ApiProperty({
    description: 'ID del periodo (opcional)',
    required: false,
    example: 3,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  periodoId?: number;

  @ApiProperty({
    description: 'Fecha planificada de la ruta (YYYY-MM-DD)',
    required: false,
    example: '2026-08-15',
  })
  @IsOptional()
  @IsString()
  fechaPlanificada?: string;

  @ApiProperty({
    description: 'Buscar por número de guía o nombre de cliente',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
