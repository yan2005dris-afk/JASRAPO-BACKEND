import { ApiProperty } from '@nestjs/swagger';

export class EnumStateDto {
  @ApiProperty({ description: 'Código del estado (valor del enum)' })
  codigo: string;

  @ApiProperty({ description: 'Nombre legible del estado para mostrar en UI' })
  nombre: string;

  @ApiProperty({ description: 'Orden de visualización en dropdowns/listas' })
  orden: number;
}

/**
 * Build a standardized state catalog from a string-enum-like const object.
 * @param enumObj The const object acting as an enum (e.g. EstadoMedidor)
 * @param names A record mapping enum values to human-readable display names
 * @returns Standardized array of EnumStateDto
 */
export function buildStateCatalog<T extends string>(
  enumObj: Record<string, T>,
  names: Record<T, string>,
): EnumStateDto[] {
  return Object.values(enumObj).map((codigo, index) => ({
    codigo,
    nombre: names[codigo],
    orden: index + 1,
  }));
}
