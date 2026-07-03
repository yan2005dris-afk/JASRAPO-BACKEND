import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReassignRouteDto {
  @ApiProperty({
    description: 'ID del nuevo operario asignado a la ruta',
    example: 15,
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  operarioId!: number;
}
