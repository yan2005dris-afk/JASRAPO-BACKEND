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
  const { estado, marca, modelo, serie, search } = filters;
  const meterFilters = { estado, marca, modelo, serie, search };

  // Eliminar campos undefined
  return Object.fromEntries(
    Object.entries(meterFilters).filter(([_, value]) => value !== undefined),
  );
}
