import { PartialType } from '@nestjs/mapped-types';
import { CreateRouteDto } from './create-route.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateRouteDto extends PartialType(CreateRouteDto) {
  @ApiProperty({
    description: 'Nuevo estado de la ruta',
    enum: ['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'PARCIAL', 'CANCELADA'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'PARCIAL', 'CANCELADA'])
  estado?: string;
}
