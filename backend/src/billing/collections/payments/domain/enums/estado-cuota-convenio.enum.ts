export const EstadoCuotaConvenio = {
  PENDIENTE: 'PENDIENTE',
  PAGADA: 'PAGADA',
} as const;

export type EstadoCuotaConvenio =
  (typeof EstadoCuotaConvenio)[keyof typeof EstadoCuotaConvenio];
