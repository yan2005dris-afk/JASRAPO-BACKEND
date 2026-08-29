import { IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReassignRouteDto {
  @ApiProperty({
    description:
      'ID del operario a asignar. Opcional: pasar `null` para desasignar la ruta (queda en bandeja de secretaría).',
    required: false,
    example: 15,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  operarioId?: number;
}
