export interface IResponseMeters {
  medidorId: bigint;
  marca: string;
  modelo: string;
  serie: string;
  estado: string;
  fechaInstalacion: Date | null;
  fechaBaja: Date | null;
  motivo: string | null;
  latitud: number | null;
  longitud: number | null;
}
