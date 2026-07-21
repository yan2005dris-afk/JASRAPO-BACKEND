export const ComprobanteEstado = {
  BORRADOR: 'BORRADOR',
  ENVIANDO: 'ENVIANDO',
  FIRMADO: 'FIRMADO',
  AUTORIZADO: 'AUTORIZADO',
  RECHAZADO: 'RECHAZADO',
  DEVUELTA: 'DEVUELTA',
} as const;

export type ComprobanteEstado =
  (typeof ComprobanteEstado)[keyof typeof ComprobanteEstado];
