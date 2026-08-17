import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { EstadoPeriodo } from 'src/generated/prisma/enums';

export class CreatePeriodDto {
  @ApiProperty({
    example: '2026-01',
    description: 'Nombre o código identificador del periodo',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del periodo es requerido' })
  nombre: string;

  @ApiProperty({
    example: '2026-01-01',
    description: 'Fecha de inicio del periodo (YYYY-MM-DD o ISO)',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @Matches(
    /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T.*|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/,
    {
      message: 'Fecha de inicio debe tener un formato válido (ej. YYYY-MM-DD)',
    },
  )
  fechaInicio: string;

  @ApiProperty({
    example: '2026-01-31',
    description: 'Fecha de fin del periodo (YYYY-MM-DD o ISO)',
  })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @Matches(
    /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T.*|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/,
    {
      message: 'Fecha de fin debe tener un formato válido (ej. YYYY-MM-DD)',
    },
  )
  fechaFin: string;

  @ApiProperty({
    example: '2026-02-15',
    description: 'Fecha de vencimiento del periodo (YYYY-MM-DD o ISO)',
  })
  @IsNotEmpty({ message: 'La fecha de vencimiento es requerida' })
  @Matches(
    /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T.*|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/,
    {
      message:
        'Fecha de vencimiento debe tener un formato válido (ej. YYYY-MM-DD)',
    },
  )
  fechaVencimiento: string;

  @ApiPropertyOptional({
    enum: EstadoPeriodo,
    default: EstadoPeriodo.ABIERTO,
    description: 'Estado inicial del periodo',
  })
  @IsEnum(EstadoPeriodo, {
    message: 'El estado debe ser ABIERTO, CERRADO o PROCESANDO',
  })
  @IsOptional()
  estado?: EstadoPeriodo;
}
