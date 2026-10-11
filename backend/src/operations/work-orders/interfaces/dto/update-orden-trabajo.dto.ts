import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoOrdenTrabajo } from 'src/shared/enums';

export class UpdateOrdenTrabajoDto {
  @ApiProperty({
    description: 'Nuevo estado de la orden de trabajo',
    enum: EstadoOrdenTrabajo,
    example: EstadoOrdenTrabajo.COMPLETADA,
  })
  @IsEnum(EstadoOrdenTrabajo)
  estado: EstadoOrdenTrabajo;

  @ApiPropertyOptional({
    description: 'Resultado u observación de la orden',
    example: 'Instalación completada exitosamente',
    required: false,
  })
  @IsOptional()
  @IsString()
  resultadoObservacion?: string;
}
