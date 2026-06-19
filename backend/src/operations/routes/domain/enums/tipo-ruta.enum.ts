export const TipoRuta = {
  TOMA_LECTURA: 'TOMA_LECTURA',
  RECONEXION: 'RECONEXION',
} as const;

export type TipoRuta = (typeof TipoRuta)[keyof typeof TipoRuta];
