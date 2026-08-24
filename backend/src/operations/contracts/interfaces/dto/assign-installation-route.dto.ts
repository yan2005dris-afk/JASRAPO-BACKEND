import { IsInt, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class AssignInstallationRouteDto {
  @ApiProperty({
    description:
      'ID de la ruta INSTALACION existente a la que se agrega el contrato. Si se omite, se crea una nueva ruta INSTALACION sin operario asignado.',
    required: false,
    example: 42,
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  routeId?: number;

  @ApiProperty({
    description:
      'Fecha planificada de la ruta en formato YYYY-MM-DD. Solo aplica cuando se crea una nueva ruta (routeId omitido).',
    required: false,
    example: '2026-08-20',
  })
  @IsOptional()
  @IsDateString()
  fechaPlanificada?: string;
}
