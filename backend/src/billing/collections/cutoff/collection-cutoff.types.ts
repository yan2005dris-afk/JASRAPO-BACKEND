import {
  COBRANZA_DIA_CORTE_MENSUAL,
  COBRANZA_MESES_PARA_CORTE,
  COBRANZA_MESES_PARA_MORA,
} from 'src/infrastructure/config/sistema-config.keys';

export const COLLECTION_CUTOFF_DEFAULTS = {
  [COBRANZA_DIA_CORTE_MENSUAL]: 15,
  [COBRANZA_MESES_PARA_MORA]: 3,
  [COBRANZA_MESES_PARA_CORTE]: 5,
} as const;

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
