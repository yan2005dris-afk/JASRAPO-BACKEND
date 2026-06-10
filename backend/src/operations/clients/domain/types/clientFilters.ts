import type { Prisma } from 'src/generated/prisma/client';
import type { FilterClientDto } from '../../interfaces/dto/filter-client.dto';

/**
 * Construye el where clause para filtros de cliente
 * Lógica:
 * - deletedAt con fecha = soft delete → excluir
 * - deletedAt null + activo false = inactivo → incluir
 * - deletedAt null + activo true = activo → incluir
 */
export function buildClientWhere(
  filters: FilterClientDto,
): Prisma.ClientesWhereInput {
  const conditions: Prisma.ClientesWhereInput[] = [];

  // Solo excluir soft-deleted (deletedAt con fecha)
  // No filtramos por activo - permite buscar clientes inactivos
  conditions.push({ deletedAt: null });

  if (filters.identificacion) {
    conditions.push({
      identificacion: { contains: filters.identificacion, mode: 'insensitive' },
    });
  }

  if (filters.nombres) {
    conditions.push({
      nombres: { contains: filters.nombres, mode: 'insensitive' },
    });
  }

  if (filters.apellidos) {
    conditions.push({
      apellidos: { contains: filters.apellidos, mode: 'insensitive' },
    });
  }

  if (filters.nombreCompleto) {
    // Buscar en nombres O apellidos
    conditions.push({
      OR: [
        { nombres: { contains: filters.nombreCompleto, mode: 'insensitive' } },
        {
          apellidos: { contains: filters.nombreCompleto, mode: 'insensitive' },
        },
      ],
    });
  }

  // Filtrar por activo (opcional)
  if (filters.activo !== undefined) {
    conditions.push({ activo: filters.activo });
  }

  // Si hay filtros adicionales, combinarlos con AND
  if (conditions.length === 1) {
    return conditions[0];
  }

  return { AND: conditions };
}
