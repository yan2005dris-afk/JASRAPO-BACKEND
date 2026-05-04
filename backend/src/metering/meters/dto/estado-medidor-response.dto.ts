import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class EstadoMedidorResponseDto {
  @ApiProperty({ example: 1, description: 'ID del estado' })
  @IsNumber()
  estadoId: number;

  @ApiProperty({ example: 'BODEGA', description: 'Código del estado' })
  @IsString()
  codigo: string;

  @ApiProperty({ example: 'En Bodega', description: 'Nombre del estado' })
  @IsString()
  nombre: string;

  @ApiProperty({ example: 1, description: 'Orden de visualización' })
  @IsNumber()
  orden: number;
}
