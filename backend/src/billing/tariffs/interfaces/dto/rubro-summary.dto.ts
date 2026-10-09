import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { EmbeddedRubro } from '../../domain/types/tariff.types';

/**
 * DTO local del BC tariffs que proyecta un Rubro (sin hidratar la
 * relation `tarifaImpuesto`, que el `select` del repo no trae).
 *
 * Es un sub-DTO de RubroResponseDto (que vive en el BC rubros) con
 * la misma forma publica pero sin la dependencia cross-BC. Permite
 * que el BC tariffs desacople su repository de `RubroMapper` y
 * `RubroResponseDto`.
 */
export class RubroSummaryDto {
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

  /**
   * Proyecta el shape interno de Rubro (que es Prisma.RubrosGetPayload<{}>
   * sin la relation `tarifaImpuesto`) al DTO publico. La forma es
   * identica a RubroResponseDto.fromRow; este sub-DTO existe solo
   * para desacoplar la dependencia de tariffs a rubros.
   */
  static fromEmbedded(row: EmbeddedRubro): RubroSummaryDto {
    const dto = new RubroSummaryDto();
    dto.rubroId = row.rubroId;
    dto.codigoSri = row.codigoSri;
    dto.nombre = row.nombre;
    dto.descripcion = row.descripcion;
    dto.precioUnitario = Number(row.precioUnitario);
    dto.tipoRubro = row.tipoRubro;
    dto.codigoSistemaRubro = row.codigoSistemaRubro ?? null;
    dto.tarifaImpuestoId = row.tarifaImpuestoId;
    dto.activo = row.activo;
    dto.esAutomatico = row.esAutomatico;
    dto.createdAt = row.createdAt;
    dto.updatedAt = row.updatedAt;
    dto.deletedAt = row.deletedAt;
    return dto;
  }
}
