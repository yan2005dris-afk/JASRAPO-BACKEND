import type { FilterMeterDto } from '../../interfaces/dto/filter-meter.dto';
import type { MeterFilters } from '../../domain/types/meter-filters';

/**
 * Builds a MeterFilters object from the incoming FilterMeterDto.
 * Strips pagination fields and returns only domain filter fields.
 */
export function buildMeterFilters(filters: FilterMeterDto): MeterFilters {
  const result: MeterFilters = {};

  if (filters.estado !== undefined) {
    result.estado = filters.estado;
  }

  if (filters.marca !== undefined) {
    result.marca = filters.marca;
  }

  if (filters.modelo !== undefined) {
    result.modelo = filters.modelo;
  }

  if (filters.serie !== undefined) {
    result.serie = filters.serie;
  }

  if (filters.buscar !== undefined) {
    result.buscar = filters.buscar;
  }

  return result;
}
