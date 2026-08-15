import { EstadoPrefactura } from 'src/shared/enums';
import { buildStateCatalog } from 'src/shared/enums/state-catalog';

const ESTADO_NAMES: Record<EstadoPrefactura, string> = {
  [EstadoPrefactura.GENERADA]: 'Generada',
  [EstadoPrefactura.EN_REVISION]: 'En Revisión',
  [EstadoPrefactura.APROBADA]: 'Aprobada',
  [EstadoPrefactura.RECHAZADA]: 'Rechazada',
  [EstadoPrefactura.ANULADA]: 'Anulada',
  [EstadoPrefactura.PAGADA]: 'Pagada',
};

export const PREINVOICE_STATES = buildStateCatalog(
  EstadoPrefactura,
  ESTADO_NAMES,
);

export const STATE_TRANSITIONS: Record<string, string[]> = {
  GENERADA: ['EN_REVISION', 'ANULADA'],
  EN_REVISION: ['APROBADA', 'RECHAZADA', 'GENERADA'],
  APROBADA: ['PAGADA', 'ANULADA'],
  RECHAZADA: ['EN_REVISION', 'GENERADA'],
  ANULADA: [],
  PAGADA: [],
};
