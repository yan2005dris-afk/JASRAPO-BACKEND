export const ComprobanteEstado = {
  BORRADOR: 'BORRADOR',
  ENVIANDO: 'ENVIANDO',
  FIRMADO: 'FIRMADO',
  AUTORIZADO: 'AUTORIZADO',
  RECHAZADO: 'RECHAZADO',
  DEVUELTA: 'DEVUELTA',
  /**
   * Comprobante parked awaiting manual operator intervention.
   * Set by `SRIEmissionDispatcherService` when `sri.emision.modo === 'manual'`.
   * Operators trigger emission via `POST /sri/comprobantes/:claveAcceso/emitir-manual`.
   * The DB column is a plain `String` — adding a literal here is code-only.
   */
  POR_EMITIR: 'POR_EMITIR',
} as const;

export type ComprobanteEstado =
  (typeof ComprobanteEstado)[keyof typeof ComprobanteEstado];
