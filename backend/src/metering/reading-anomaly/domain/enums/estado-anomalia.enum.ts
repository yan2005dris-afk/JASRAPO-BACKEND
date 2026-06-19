export const EstadoAnomalia = {
  PENDIENTE: 'PENDIENTE',
  EN_REVISION: 'EN_REVISION',
  RESUELTA: 'RESUELTA',
  DESCARTADA: 'DESCARTADA',
} as const;

export type EstadoAnomalia = (typeof EstadoAnomalia)[keyof typeof EstadoAnomalia];
