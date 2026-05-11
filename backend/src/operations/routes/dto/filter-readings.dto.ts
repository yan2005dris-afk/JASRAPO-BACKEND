import {
  IsNotEmpty,
  IsOptional,
  IsIn,
  IsNumber,
  IsInt,
  Min,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class FilterReadingsDto {
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
  @IsNumber()
  @Type(() => Number)
  comunidadId!: number;

  @ApiProperty({
    description: 'ID del sector (opcional)',
    required: false,
    example: 2,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  sectorId?: number;

  @ApiProperty({
    description: 'Buscar por número de guía o nombre de cliente',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Registros a omitir (paginación)',
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  skip?: number;

  @ApiProperty({
    description: 'Límite de registros (paginación)',
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  take?: number;
}
