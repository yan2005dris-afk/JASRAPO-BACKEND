export interface IResponseReadingAnomaly {
  anomaliaId: string;
  lecturaId: string;
  observacion: string | null;
  tipo: string;
  estado: string;
  fotoUrl: string | null;
  lectura?: {
    lecturaId: string;
    fecha: Date;
    lecturaActual: number;
    consumoCalculado: number;
  } | null;
}
