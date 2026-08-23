import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoRuta } from 'src/shared/enums';

export class UpdateRouteStateDto {
  @ApiProperty({
    description: 'Nuevo estado de la ruta',
    enum: EstadoRuta,
    example: EstadoRuta.EN_PROGRESO,
  })
  @IsEnum(EstadoRuta)
  estado: EstadoRuta;

  @ApiPropertyOptional({
    description: 'Observación (requerida para CANCELADA)',
    example: 'Cliente no disponible',
  })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  observacion?: string;
}
