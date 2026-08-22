import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TarifaImpuestoInfo } from '../../domain/types/rubro.types';

export class TarifaImpuestoResponseDto implements TarifaImpuestoInfo {
  @ApiProperty({ description: 'ID de la tarifa de impuesto', example: 1 })
  id!: number;

  @ApiProperty({ description: 'ID del impuesto relacionado', example: 1 })
  impuestoId!: number;

  @ApiProperty({ description: 'Código SRI del porcentaje', example: '2' })
  codigoPorcentaje!: string;

  @ApiProperty({
    description: 'Descripción de la tarifa de impuesto',
    example: 'IVA 12%',
  })
  descripcion!: string;

  @ApiProperty({ description: 'Porcentaje aplicable', example: 12 })
  porcentaje!: number;

  @ApiProperty({
    description: 'Indica si la tarifa está activa',
    example: true,
  })
  activo!: boolean;
}

export class TarifaImpuestoNestedDto {
  @ApiProperty({ description: 'ID de la tarifa', example: 1 })
  id!: number;

  @ApiProperty({ description: 'Código SRI del porcentaje', example: '2' })
  codigoPorcentaje!: string;

  @ApiProperty({ description: 'Porcentaje', example: 12 })
  porcentaje!: number;

  @ApiProperty({ description: 'Descripción', example: 'IVA 12%' })
  descripcion!: string;
}

export class RubroResponseDto {
  @ApiProperty({ description: 'ID único del rubro', example: 1 })
  rubroId!: number;

  @ApiPropertyOptional({
    description: 'Código SRI',
    example: '001',
    nullable: true,
  })
  codigoSri!: string | null;

  @ApiProperty({ description: 'Nombre del rubro', example: 'Consumo Agua' })
  nombre!: string;

  @ApiProperty({
    description: 'Descripción del rubro',
    example: 'Consumo de agua potable m3',
  })
  descripcion!: string;

  @ApiProperty({ description: 'Precio unitario en USD', example: 0.5 })
  precioUnitario!: number;

  @ApiProperty({ description: 'Tipo de rubro', example: 'VARIABLE' })
  tipoRubro!: string;

  @ApiProperty({ description: 'ID de la tarifa de impuesto', example: 1 })
  tarifaImpuestoId!: number;

  @ApiPropertyOptional({
    description: 'Información de la tarifa de impuesto asociada',
    type: TarifaImpuestoNestedDto,
  })
  tarifaImpuesto?: TarifaImpuestoNestedDto;

  @ApiPropertyOptional({
    description: 'Código de sistema interno del rubro',
    example: 'INSTALACION',
    nullable: true,
  })
  codigoSistemaRubro?: string | null;

  @ApiProperty({ description: 'Estado del rubro', example: true })
  activo!: boolean;

  @ApiProperty({
    description: 'Indica si el rubro es autogenerado/calculado por el sistema',
    example: false,
  })
  esAutomatico!: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2026-08-17T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2026-08-17T00:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiPropertyOptional({
    description: 'Fecha de eliminación suave',
    example: null,
    nullable: true,
  })
  deletedAt!: Date | null;

  static fromEntity(entity: any): RubroResponseDto {
    const dto = new RubroResponseDto();
    dto.rubroId = entity.rubroId;
    dto.codigoSri = entity.codigoSri;
    dto.nombre = entity.nombre;
    dto.descripcion = entity.descripcion;
    dto.precioUnitario = Number(entity.precioUnitario);
    dto.tipoRubro = entity.tipoRubro;
    dto.codigoSistemaRubro = entity.codigoSistemaRubro ?? null;
    dto.tarifaImpuestoId = entity.tarifaImpuestoId;
    if (entity.tarifaImpuesto) {
      dto.tarifaImpuesto = entity.tarifaImpuesto;
    }
    dto.activo = entity.activo;
    dto.esAutomatico = entity.esAutomatico;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.deletedAt = entity.deletedAt;
    return dto;
  }
}
