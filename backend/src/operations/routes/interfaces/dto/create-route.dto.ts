import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsIn,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CreateRouteDto {
  @ApiProperty({
    description: 'Nombre descriptivo de la ruta',
    example: 'Ruta Sector Norte - 2026-05-10',
  })
  @IsNotEmptyString()
  @MaxLength(200)
  nombre!: string;

  @ApiProperty({
    description: 'Descripción opcional de la ruta',
    required: false,
    example: 'Toma de lecturas del sector norte',
  })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(500)
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
    description: 'ID del periodo contable',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  periodoId!: number;

  @ApiProperty({
    description: 'Fecha planificada para ejecutar la ruta',
    required: false,
    example: '2026-05-10',
  })
  @IsOptional()
  @IsDateString()
  fechaPlanificada?: string;
}
