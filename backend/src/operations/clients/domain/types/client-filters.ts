import type { FilterClientDto } from '../../interfaces/dto/filter-client.dto';

export interface ClientFilters {
  identificacion?: string;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  activo?: boolean;
}

/**
 * Builds a ClientFilters object from the incoming FilterClientDto.
 * Strips pagination fields (page, limit) and returns only domain filter fields.
 */
export function buildClientFilters(filters: FilterClientDto): ClientFilters {
  const result: ClientFilters = {};

  if (filters.identificacion !== undefined) {
    result.identificacion = filters.identificacion;
  }

  if (filters.nombres !== undefined) {
    result.nombres = filters.nombres;
  }

  if (filters.apellidos !== undefined) {
    result.apellidos = filters.apellidos;
  }

  if (filters.nombreCompleto !== undefined) {
    result.nombreCompleto = filters.nombreCompleto;
  }

  if (filters.activo !== undefined) {
    result.activo = filters.activo;
  }

  return result;
}
