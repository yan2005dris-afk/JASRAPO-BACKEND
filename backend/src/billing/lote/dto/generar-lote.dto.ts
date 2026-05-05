import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class GenerarLoteDto {
  @ApiProperty({ description: 'ID del periodo a facturar', example: 1 })
  @IsInt()
  periodoId: number;

  @ApiProperty({
    description: 'ID de la comunidad (opcional, si es null factura todo)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsInt()
  comunidadId?: number;

  @ApiProperty({
    description: 'Usuario que genera el lote',
    example: 'admin',
    required: false,
  })
  @IsOptional()
  @IsString()
  creadoPor?: string;
}
