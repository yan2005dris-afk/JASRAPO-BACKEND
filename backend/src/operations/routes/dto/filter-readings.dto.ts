import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum TipoRuta {
  TOMA_LECTURA = 'TOMA_LECTURA',
  RECONEXION = 'RECONEXION',
}

export class FilterReadingsDto {
  @ApiProperty({
    description: 'Tipo de ruta para filtrar lecturas elegibles',
    enum: TipoRuta,
  })
  @IsNotEmpty()
  @IsEnum(TipoRuta)
  tipoRuta!: TipoRuta;

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
  @IsNumber()
  @Type(() => Number)
  skip?: number;

  @ApiProperty({
    description: 'Límite de registros (paginación)',
    required: false,
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  take?: number;
}
