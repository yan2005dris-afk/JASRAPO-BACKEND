export interface IResponseReading {
  lecturaId: string;
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
  contratoId: string;
  descripcionAnomalia: string | null;
  fechaValidacion: Date | null;
  fotoUrl: string | null;
  isValidada: boolean;
  lecturaInicial: boolean;
  periodoId: number;
  tieneAnomalia: boolean;
  estado: string;
  contrato?: {
    contratoId: string;
    numeroGuia: string;
    direccionSuministro: string;
    estado: string;
  } | null;
  medidor?: {
    medidorId: string;
    serie: string;
    marca: string;
    modelo: string;
  } | null;
  periodoRel?: {
    periodoId: number;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
  } | null;
}
