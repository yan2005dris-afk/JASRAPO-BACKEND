import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSistemaConfigDto {
  @ApiProperty({
    description: 'Clave única de la configuración',
    example: 'reporte.estilo',
  })
  @IsNotEmpty({ message: 'La clave es obligatoria' })
  @IsString({ message: 'La clave debe ser texto' })
  clave!: string;

  @ApiProperty({
    description: 'Valor de la configuración',
    example: 'modern',
  })
  @IsNotEmpty({ message: 'El valor es obligatorio' })
  @IsString({ message: 'El valor debe ser texto' })
  valor!: string;

  @ApiPropertyOptional({
    description: 'Descripción del propósito de la configuración',
    example: 'Estilo global para todos los reportes PDF (legacy|modern)',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;
}

export class UpdateSistemaConfigDto {
  @ApiPropertyOptional({
    description: 'Nuevo valor de la configuración',
    example: 'modern',
  })
  @IsOptional()
  @IsString({ message: 'El valor debe ser texto' })
  valor?: string;

  @ApiPropertyOptional({
    description: 'Descripción del propósito de la configuración',
    example: 'Estilo global para todos los reportes PDF (legacy|modern)',
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser texto' })
  descripcion?: string;
}

export class SistemaConfigResponseDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'reporte.estilo' })
  clave!: string;

  @ApiProperty({ example: 'modern' })
  valor!: string;

  @ApiPropertyOptional({
    example: 'Estilo global para todos los reportes PDF (legacy|modern)',
  })
  descripcion?: string | null;

  @ApiProperty({ example: '2026-08-17T02:46:32.048Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2026-08-17T02:46:32.048Z' })
  updatedAt!: Date;
}
