import { IsInt, IsOptional } from 'class-validator';
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
}
