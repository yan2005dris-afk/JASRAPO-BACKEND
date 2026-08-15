import type { FilterClientDto } from '../../interfaces/dto/filter-client.dto';
import type { ClientFilters } from '../../domain/types/client.types';

/**
 * Builds a ClientFilters object from the incoming FilterClientDto.
 * Strips pagination fields (page, limit) and returns only domain filter fields.
 */
export function buildClientFilters(filters: FilterClientDto): ClientFilters {
  // Excluir explícitamente los campos de paginación
  const { page: _page, limit: _limit, ...clientFilters } = filters;

  // Eliminar campos undefined
  return Object.fromEntries(
    Object.entries(clientFilters).filter(([_, value]) => value !== undefined),
  );
}
