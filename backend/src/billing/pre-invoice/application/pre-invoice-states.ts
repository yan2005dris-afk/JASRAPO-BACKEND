export const PREINVOICE_STATES = [
  { estadoId: 1, codigo: 'GENERADA', nombre: 'Generated', orden: 1 },
  { estadoId: 2, codigo: 'EN_REVISION', nombre: 'In Review', orden: 2 },
  { estadoId: 3, codigo: 'APROBADA', nombre: 'Approved', orden: 3 },
  { estadoId: 4, codigo: 'RECHAZADA', nombre: 'Rejected', orden: 4 },
  { estadoId: 5, codigo: 'ANULADA', nombre: 'Voided', orden: 5 },
  { estadoId: 6, codigo: 'PAGADA', nombre: 'Paid', orden: 6 },
];

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
