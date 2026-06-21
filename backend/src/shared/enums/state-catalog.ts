import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EnumStateDto {
  @ApiProperty({ description: 'Código del estado (valor del enum)' })
  codigo: string;

  @ApiProperty({ description: 'Nombre legible del estado para mostrar en UI' })
  nombre: string;

  @ApiProperty({ description: 'Orden de visualización en dropdowns/listas' })
  orden: number;

  @ApiPropertyOptional({ description: 'Clase de ícono Bootstrap para la UI (ej. bi-clock)' })
  icono?: string;
}

export function buildStateCatalog<T extends string>(
  enumObj: Record<string, T>,
  names: Record<T, string>,
  icons?: Partial<Record<T, string>>,
): EnumStateDto[] {
  return Object.values(enumObj).map((codigo, index) => ({
    codigo,
    nombre: names[codigo],
    orden: index + 1,
    ...(icons?.[codigo] ? { icono: icons[codigo] } : {}),
  }));
}
