import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DiscountEntity {
  @ApiProperty({ description: 'ID único del descuento' })
  id!: number;

  @ApiProperty({ description: 'Nombre del descuento' })
  nombre!: string;

  @ApiPropertyOptional({ description: 'Descripción opcional', nullable: true })
  descripcion!: string | null;

  @ApiProperty({ description: 'Tipo de descuento' })
  tipoDescuento!: string;

  @ApiProperty({ description: 'Valor del descuento' })
  valor!: number;

  @ApiProperty({ description: 'Indica si el valor es un porcentaje' })
  esPorcentaje!: boolean;

  @ApiPropertyOptional({ description: 'ID del rubro asociado', nullable: true })
  rubroId!: number | null;

  @ApiProperty({ description: 'Indica si el descuento está activo' })
  activo!: boolean;

  @ApiProperty({ description: 'Indica si se aplica automáticamente' })
  aplicaAutomatico!: boolean;

  constructor(partial: Partial<DiscountEntity>) {
    Object.assign(this, partial);
  }
}
