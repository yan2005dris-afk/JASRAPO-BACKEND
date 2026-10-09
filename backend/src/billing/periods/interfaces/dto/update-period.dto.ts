import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePeriodDto } from './create-period.dto';
import { IsEnum, IsOptional, IsString, Matches } from 'class-validator';
import { EstadoPeriodo } from 'src/shared/enums';

export class UpdatePeriodDto extends PartialType(CreatePeriodDto) {
  @ApiPropertyOptional({
    example: '2026-01',
    description: 'Nombre o código identificador del periodo',
  })
  @IsString()
  @IsOptional()
  nombre?: string;

  @ApiPropertyOptional({
    example: '2026-01-01',
    description: 'Fecha de inicio del periodo (YYYY-MM-DD o ISO)',
  })
  @Matches(
    /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T.*|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/,
    {
      message: 'Fecha de inicio debe tener un formato válido (ej. YYYY-MM-DD)',
    },
  )
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    example: '2026-01-31',
    description: 'Fecha de fin del periodo (YYYY-MM-DD o ISO)',
  })
  @Matches(
    /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T.*|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/,
    {
      message: 'Fecha de fin debe tener un formato válido (ej. YYYY-MM-DD)',
    },
  )
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({
    example: '2026-02-15',
    description: 'Fecha de vencimiento del periodo (YYYY-MM-DD o ISO)',
  })
  @Matches(
    /^(\d{4}-\d{2}-\d{2}|\d{4}-\d{2}-\d{2}T.*|\d{2}\/\d{2}\/\d{4}|\d{2}-\d{2}-\d{4})$/,
    {
      message:
        'Fecha de vencimiento debe tener un formato válido (ej. YYYY-MM-DD)',
    },
  )
  @IsOptional()
  fechaVencimiento?: string;

  @ApiPropertyOptional({
    enum: EstadoPeriodo,
    description: 'Estado del periodo (ABIERTO, CERRADO, PROCESANDO)',
  })
  @IsEnum(EstadoPeriodo, {
    message: 'El estado debe ser ABIERTO, CERRADO o PROCESANDO',
  })
  @IsOptional()
  estado?: EstadoPeriodo;
}
