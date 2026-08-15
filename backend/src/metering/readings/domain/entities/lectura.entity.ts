export class LecturaEntity {
  lecturaId: bigint;
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
  medidorId: bigint;
  descripcionAnomalia: string | null;
  fechaValidacion: Date | null;
  fotoUrl: string | null;
  isValidada: boolean;
  lecturaInicial: boolean;
  periodoId: number;
  tieneAnomalia: boolean;
  estado: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;

  // Relaciones opcionales del dominio
  contrato?: {
    contratoId: bigint;
    numeroGuia: string;
    direccionSuministro: string;
    estado: string;
  } | null;

  medidor?: {
    medidorId: bigint;
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

  constructor(partial: Partial<LecturaEntity>) {
    Object.assign(this, partial);
  }
}
