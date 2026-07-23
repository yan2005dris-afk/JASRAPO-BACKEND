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
  /**
   * Comprobante generado con `tipoEmision=CONTINGENCIA` (clave de acceso con
   * dígito 48 = '2') porque el SRI estaba detectado como no disponible
   * (circuit breaker abierto) al momento de emitir. Queda firmado y válido
   * para entrega al cliente, pendiente de reenvío al SRI cuando el servicio
   * se recupere. Ver `SriAvailabilityService` y `SriBaseService.resolverTipoEmision`.
   * El DB column es un `String` plano — agregar el literal aquí es code-only.
   */
  PENDIENTE_CONTINGENCIA: 'PENDIENTE_CONTINGENCIA',
} as const;

export type ComprobanteEstado =
  (typeof ComprobanteEstado)[keyof typeof ComprobanteEstado];
