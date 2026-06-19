export const EstadoRuta = {
  PENDIENTE: 'PENDIENTE',
  EN_PROGRESO: 'EN_PROGRESO',
  COMPLETADA: 'COMPLETADA',
  PARCIAL: 'PARCIAL',
  CANCELADA: 'CANCELADA',
} as const;

export type EstadoRuta = (typeof EstadoRuta)[keyof typeof EstadoRuta];
