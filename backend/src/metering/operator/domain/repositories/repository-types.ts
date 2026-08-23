// ── Repository return type interfaces ─────────────────────────────────
// Domain contracts returned by the OperatorRepository port — framework-free
// shapes, not Prisma query shapes. Prisma specifics live in the infrastructure
// implementation.

export interface ReadingWithContractDetail {
  lecturaId: bigint;
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
  descripcionAnomalia: string | null;
  fechaValidacion: Date | null;
  fotoUrl: string | null;
  lecturaInicial: boolean;
  periodoId: number;
  estado: string;
  medidor: {
    medidorId: bigint;
    serie: string;
    marca: string;
    modelo: string;
    historial: Array<{
      contrato: {
        contratoId: bigint;
        numeroGuia: string;
        direccionSuministro: string;
        estado: string;
        comunidadId: number;
        sectorId: number | null;
        cliente: { nombres: string; apellidos: string };
      } | null;
    }>;
  } | null;
  periodoRel: {
    periodoId: number;
    nombre: string;
    fechaInicio: Date;
    fechaFin: Date;
  } | null;
}

export interface MeterWithContractDetail {
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
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  historial: Array<{
    contrato: {
      contratoId: bigint;
      comunidadId: number;
      sectorId: number | null;
      direccionSuministro: string;
      cliente: { nombres: string; apellidos: string };
    } | null;
  }>;
}

export interface OperatorRouteStop {
  ordenTrabajoId: bigint;
  latitud: number;
  longitud: number;
  serie: string;
  clienteNombre: string;
  tipoActividad: string;
  estado: string;
  direccionSuministro?: string;
}

export interface OperatorWorkOrder {
  ordenTrabajoId: bigint;
  rutaId: bigint;
  contratoId: bigint;
  medidorId: bigint | null;
  lecturaId: bigint | null;
  tipoActividad: string;
  estado: string;
  ordenVisita: number;
  resultadoObservacion: string | null;
  evidenciaFotoUrl: string | null;
  completadoEn: Date | null;
  contrato: {
    numeroGuia: string;
    direccionSuministro: string;
    cliente: {
      nombres: string;
      apellidos: string;
      razonSocial: string | null;
    };
  };
  medidor: {
    medidorId: bigint;
    serie: string;
    latitud: number | null;
    longitud: number | null;
  } | null;
}

export interface OperatorRoute {
  rutaId: bigint;
  nombre: string;
  descripcion: string | null;
  operarioId: number;
  tipoRuta: string;
  comunidadId: number;
  sectorId: number | null;
  periodoId: number | null;
  estado: string;
  fechaPlanificada: Date | null;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  orden: number;
  observacion: string | null;
  fechaLimite: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  operario?: {
    usuarioId: number;
    nombres: string;
    apellidos: string;
  ordenesTrabajo: OperatorWorkOrder[];
  paradas: OperatorRouteStop[];
}

export interface ReadingWithAnomalies {
  lecturaId: bigint;
  fecha?: Date;
  lecturaAnterior?: number;
  lecturaActual?: number;
  consumoCalculado?: number;
  estado: string;
  periodoId?: number;
  descripcionAnomalia?: string | null;
  medidor: {
    medidorId: bigint;
    serie: string;
    marca: string;
    modelo: string;
  } | null;
  lecturaAnomalias: Array<{
    anomaliaId: bigint;
    tipo: string;
    estado: string;
    observacion: string | null;
    createdAt: Date;
  }>;
}

/** Fields that can be updated when transitioning a route's state. */
export interface RouteStateUpdate {
  estado?: string;
  fechaInicio?: Date;
  fechaFin?: Date;
  observacion?: string | null;
}

export interface OperatorUser {
  usuarioId: number;
  email: string;
  rolId: number | null;
  nombres: string | null;
  apellidos: string | null;
  telefono: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  deletedAt: Date | null;
}
