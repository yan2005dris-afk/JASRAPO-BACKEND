export const EstadoMedidor = {
  BODEGA: 'BODEGA',
  INSTALADO: 'INSTALADO',
  DANADO: 'DANADO',
  PENDIENTE: 'PENDIENTE',
  BAJA: 'BAJA',
} as const;

export type EstadoMedidor = (typeof EstadoMedidor)[keyof typeof EstadoMedidor];
