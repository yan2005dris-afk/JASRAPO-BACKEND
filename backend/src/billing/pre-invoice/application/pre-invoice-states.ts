import { EstadoPrefactura } from '../domain/enums/estado-prefactura.enum';

/**
 * Generate state catalog from Prisma enum.
 * Each state gets: codigo (enum value), nombre (display name), orden (sort order).
 */
const ESTADO_NAMES: Record<EstadoPrefactura, string> = {
  [EstadoPrefactura.GENERADA]: 'Generada',
  [EstadoPrefactura.EN_REVISION]: 'En Revisión',
  [EstadoPrefactura.APROBADA]: 'Aprobada',
  [EstadoPrefactura.RECHAZADA]: 'Rechazada',
  [EstadoPrefactura.ANULADA]: 'Anulada',
  [EstadoPrefactura.PAGADA]: 'Pagada',
};

export const PREINVOICE_STATES = Object.values(EstadoPrefactura).map(
  (codigo, index) => ({
    estadoId: index + 1,
    codigo,
    nombre: ESTADO_NAMES[codigo],
    orden: index + 1,
  }),
);

/**
 * Allowed status transitions.
 * Key = current status, value = statuses it can transition to
 */
export const STATE_TRANSITIONS: Record<string, string[]> = {
  GENERADA: ['EN_REVISION', 'ANULADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'GENERADA'],
  APROBADA: ['PAGADA', 'ANULADA'],
  RECHAZADA: ['EN_REVISION', 'GENERADA'],
  ANULADA: [],
  PAGADA: [],
};
