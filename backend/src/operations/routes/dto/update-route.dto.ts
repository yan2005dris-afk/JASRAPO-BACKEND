import { PartialType, PickType } from '@nestjs/swagger';
import { CreateRouteDto } from './create-route.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRouteDto extends PartialType(
  PickType(CreateRouteDto, [
    'nombre',
    'descripcion',
    'fechaPlanificada',
  ] as const),
) {
  @ApiProperty({
    description: 'Nuevo estado de la ruta',
    enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'PARCIAL', 'CANCELADA'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'PARCIAL', 'CANCELADA'])
  estado?: string;
}
