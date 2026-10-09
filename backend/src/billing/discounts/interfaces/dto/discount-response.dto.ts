import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Decimal } from 'decimal.js';
import type { DiscountRow } from '../../domain/types/discount.types';

export class DiscountResponseDto {
  @ApiProperty({ example: 1, description: 'ID único del descuento' })
  id: number;

  @ApiProperty({ example: 'Tercera Edad', description: 'Nombre del descuento' })
  nombre: string;

  @ApiPropertyOptional({
    example: 'Descuento para adultos mayores',
    nullable: true,
    description: 'Descripción opcional',
  })
  descripcion: string | null;

  @ApiProperty({ example: 'TERCERA_EDAD', description: 'Tipo de descuento' })
  tipoDescuento: string;

  @ApiProperty({ example: 50, description: 'Valor del descuento' })
  valor: number;

  @ApiProperty({
    example: true,
    description: 'Indica si el valor es un porcentaje',
  })
  esPorcentaje: boolean;

  @ApiPropertyOptional({
    example: 2,
    nullable: true,
    description: 'ID del rubro asociado',
  })
  rubroId: number | null;

  @ApiPropertyOptional({
    description: 'Datos del rubro asociado',
    nullable: true,
  })
  rubro?: {
    rubroId: number;
    nombre: string;
    tipoRubro: string;
    precioUnitario: number;
  } | null;

  @ApiProperty({
    example: true,
    description: 'Indica si el descuento está activo',
  })
  activo: boolean;

  @ApiProperty({
    example: false,
    description: 'Indica si se aplica automáticamente',
  })
  aplicaAutomatico: boolean;

  static fromRow(row: DiscountRow): DiscountResponseDto {
    const dto = new DiscountResponseDto();
    dto.id = row.id;
    dto.nombre = row.nombre;
    dto.descripcion = row.descripcion ?? null;
    dto.tipoDescuento = row.tipoDescuento;
    dto.valor =
      row.valor instanceof Decimal ? row.valor.toNumber() : Number(row.valor);
    dto.esPorcentaje = row.esPorcentaje;
    dto.rubroId = row.rubroId ?? null;
    dto.rubro = row.rubro
      ? {
          rubroId: row.rubro.rubroId,
          nombre: row.rubro.nombre,
          tipoRubro: row.rubro.tipoRubro,
          precioUnitario:
            row.rubro.precioUnitario instanceof Decimal
              ? row.rubro.precioUnitario.toNumber()
              : Number(row.rubro.precioUnitario),
        }
      : null;
    dto.activo = row.activo;
    dto.aplicaAutomatico = row.aplicaAutomatico;
    return dto;
  }

  static fromRowList(rows: DiscountRow[]): DiscountResponseDto[] {
    return rows.map((r) => DiscountResponseDto.fromRow(r));
  }
}
