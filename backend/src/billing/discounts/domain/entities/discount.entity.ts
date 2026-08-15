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
    if (partial) {
      this.validateInvariants();
    }
  }

  static create(props: Partial<DiscountEntity>): DiscountEntity {
    return new DiscountEntity(props);
  }

  validateInvariants(): void {
    if (this.valor !== undefined && this.valor !== null) {
      if (this.esPorcentaje) {
        if (this.valor < 0 || this.valor > 100) {
          throw new Error(
            'El valor del descuento en porcentaje debe estar entre 0 y 100',
          );
        }
      } else {
        if (this.valor <= 0) {
          throw new Error('El valor del descuento fijo debe ser mayor a 0');
        }
      }
    }
  }

  activar(): void {
    this.activo = true;
  }

  desactivar(): void {
    this.activo = false;
  }

  actualizarValor(nuevoValor: number, esPorcentaje?: boolean): void {
    if (esPorcentaje !== undefined) {
      this.esPorcentaje = esPorcentaje;
    }
    this.valor = nuevoValor;
    this.validateInvariants();
  }

  calcularDescuento(montoBase: number): number {
    if (!this.activo) return 0;
    if (this.esPorcentaje) {
      return (montoBase * this.valor) / 100;
    }
    return Math.min(montoBase, this.valor);
  }
}
