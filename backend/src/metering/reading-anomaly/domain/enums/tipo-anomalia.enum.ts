export const TipoAnomalia = {
  FUGA: 'FUGA',
  MEDIDOR_DAÑADO: 'MEDIDOR_DAÑADO',
  LECTURA_ERRONEA: 'LECTURA_ERRONEA',
  OTRO: 'OTRO',
} as const;

export type TipoAnomalia = (typeof TipoAnomalia)[keyof typeof TipoAnomalia];
