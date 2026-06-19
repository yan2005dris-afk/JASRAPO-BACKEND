export const EstadoLectura = {
  PENDIENTE: 'PENDIENTE',
  POR_REVISION: 'POR_REVISION',
  APROBADA: 'APROBADA',
  RECHAZADA_VERIFICACION: 'RECHAZADA_VERIFICACION',
  ESTIMADA: 'ESTIMADA',
  PLANILLADA: 'PLANILLADA',
} as const;

export type EstadoLectura = (typeof EstadoLectura)[keyof typeof EstadoLectura];
