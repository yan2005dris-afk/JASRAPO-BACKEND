import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsDateString,
  IsArray,
  ArrayNotEmpty,
  IsNumberString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateRouteDto {
  @ApiProperty({
    description: 'Nombre descriptivo de la ruta',
    example: 'Ruta Sector Norte - 2026-05-10',
  })
  @IsNotEmpty()
  nombre!: string;

  @ApiProperty({
    description: 'Descripción opcional de la ruta',
    required: false,
    example: 'Toma de lecturas del sector norte',
  })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'ID del usuario operario responsable',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  operarioId!: number;

  @ApiProperty({
    description: 'Tipo de ruta a crear',
    enum: ['TOMA_LECTURA', 'RECONEXION'],
    example: 'TOMA_LECTURA',
  })
  @IsNotEmpty()
  @IsIn(['TOMA_LECTURA', 'RECONEXION'])
  tipoRuta!: 'TOMA_LECTURA' | 'RECONEXION';

  @ApiProperty({
    description: 'ID de la comunidad donde se aplicará la ruta',
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
    description: 'Fecha planificada para ejecutar la ruta',
    required: false,
    example: '2026-05-10',
  })
  @IsOptional()
  @IsDateString()
  fechaPlanificada?: string;

  @ApiProperty({
    description: 'IDs de las lecturas a asignar a esta ruta',
    isArray: true,
    type: String,
    example: ['1', '3', '5', '7'],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsNumberString({}, { each: true })
  @Type(() => String)
  lecturaIds!: string[];
}
