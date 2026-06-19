export const EstadoLote = {
  BORRADOR: 'BORRADOR',
  DEFINITIVO: 'DEFINITIVO',
  ENVIADO: 'ENVIADO',
} as const;

export type EstadoLote = (typeof EstadoLote)[keyof typeof EstadoLote];
