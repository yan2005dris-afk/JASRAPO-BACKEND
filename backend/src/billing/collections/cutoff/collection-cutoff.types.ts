import { COLLECTION_CUTOFF_DEFAULTS } from 'src/infrastructure/config/sistema-config.keys';

export { COLLECTION_CUTOFF_DEFAULTS };

export interface CollectionCutoffConfig {
  diaCorteMensual: number;
  mesesParaMora: number;
  mesesParaCorte: number;
}

export const COLLECTION_CUTOFF_EVALUATION_STATUS = {
  DEUDA_PENDIENTE: 'DEUDA_PENDIENTE',
  EN_MORA: 'EN_MORA',
} as const;

export type CollectionCutoffEvaluationStatus =
  (typeof COLLECTION_CUTOFF_EVALUATION_STATUS)[keyof typeof COLLECTION_CUTOFF_EVALUATION_STATUS];

export interface CollectionCutoffCandidate {
  contratoId: string;
  numeroGuia: string;
  cliente: CollectionCutoffCustomer;
  comunidad: CollectionCutoffCommunity;
  totalDeuda: number;
  periodosVencidos: number;
  estadoCobranza: 'AL_DIA' | 'EN_MORA';
  estadoCobranzaPersistido: string;
  estadoEvaluacion: CollectionCutoffEvaluationStatus;
  tieneConvenioActivo: boolean;
  elegibleParaCorte: boolean;
  razon: string;
}

interface CollectionCutoffCustomer {
  nombres: string | null;
  apellidos: string | null;
  razonSocial: string | null;
  identificacion: string | null;
}

interface CollectionCutoffCommunity {
  comunidadId: number;
  nombre: string;
}
