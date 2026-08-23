import type { FilterMeterDto } from '../../interfaces/dto/filter-meter.dto';
import type { ExportMeterDto } from '../../interfaces/dto/export-meter.dto';
import type { MeterFilters } from '../../domain/types/meter.types';

/**
 * Builds a MeterFilters object from the incoming FilterMeterDto.
 * Strips pagination fields and returns only domain filter fields.
 */
export function buildMeterFilters(
  filters: FilterMeterDto | ExportMeterDto,
): MeterFilters {
  const meterFilters: MeterFilters = {
    estado: filters.estado,
    search: filters.search,
    ...('marca' in filters && { marca: filters.marca }),
    ...('modelo' in filters && { modelo: filters.modelo }),
    ...('serie' in filters && { serie: filters.serie }),
  };

  // Eliminar campos undefined
  return Object.fromEntries(
    Object.entries(meterFilters).filter(([_, value]) => value !== undefined),
  );
}
