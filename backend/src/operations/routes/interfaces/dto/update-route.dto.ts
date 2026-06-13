import { PartialType, PickType } from '@nestjs/swagger';
import { CreateRouteDto } from './create-route.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { EstadoRuta } from 'src/generated/prisma/client';

export class UpdateRouteDto extends PartialType(
  PickType(CreateRouteDto, [
    'nombre',
    'descripcion',
    'fechaPlanificada',
    'periodoId',
  ] as const),
) {
  @ApiProperty({
    description: 'Nuevo estado de la ruta',
    enum: EstadoRuta,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoRuta)
  estado?: EstadoRuta;
}
