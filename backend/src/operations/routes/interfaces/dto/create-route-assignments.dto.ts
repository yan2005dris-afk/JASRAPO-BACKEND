import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmptyString } from 'src/infrastructure/common/decorators/is-not-empty-string.decorator';

export class CreateRouteAssignmentsDto {
  @ApiProperty({
    description: 'ID del periodo contable / operativo',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  periodoId!: number;

  @ApiProperty({
    description: 'ID del operario asignado',
    example: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  operarioId!: number;

  @ApiProperty({
    description: 'ID de la comunidad objetivo',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  comunidadId!: number;

  @ApiProperty({
    description:
      'IDs de los sectores a asignar. Si está vacío o no se envía, la asignación se realiza para toda la comunidad.',
    required: false,
    example: [1, 2],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  sectorIds?: number[];

  @ApiProperty({
    description: 'Fecha planificada para las rutas (formato YYYY-MM-DD)',
    required: false,
    example: '2026-05-15',
  })
  @IsOptional()
  @IsDateString()
  fechaPlanificada?: string;

  @ApiProperty({
    description: 'Nombre base para las rutas creadas (opcional)',
    required: false,
    example: 'Ruta de Lectura',
  })
  @IsOptional()
  @IsNotEmptyString()
  @MaxLength(200)
  nombreBase?: string;
}
