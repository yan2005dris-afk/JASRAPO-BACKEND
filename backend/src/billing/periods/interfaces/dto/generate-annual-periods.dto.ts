import {
  IsEnum,
  IsInt,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { EstadoPeriodo } from 'src/generated/prisma/enums';

export class GenerateAnnualPeriodsDto {
  @ApiProperty({
    description: 'Año fiscal / operativo a generar (ej. 2026)',
    example: 2026,
    minimum: 2020,
    maximum: 2100,
  })
  @IsInt()
  @Min(2020)
  @Max(2100)
  @Type(() => Number)
  year!: number;

  @ApiProperty({
    description:
      'Día de vencimiento para el pago de cada mes (ej. 15 del mes siguiente)',
    example: 15,
    minimum: 1,
    maximum: 28,
    required: false,
    default: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(28)
  @Type(() => Number)
  diaVencimiento?: number;

  @ApiProperty({
    description: 'Estado inicial de los períodos generados',
    enum: EstadoPeriodo,
    required: false,
    default: EstadoPeriodo.CERRADO,
  })
  @IsOptional()
  @IsEnum(EstadoPeriodo)
  estadoInicial?: EstadoPeriodo;
}
