// ── Repository return type interfaces ─────────────────────────────────
// Domain contracts returned by the OperatorRepository port — framework-free
// shapes, not Prisma query shapes. Prisma specifics live in the infrastructure
// implementation.

export interface SyncCursorPosition {
  updatedAt: Date;
  id: bigint;
}

export interface SyncSnapshotContext {
  snapshotVersion: Date;
  watermark: bigint;
}

export interface SyncPage<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextPosition: SyncCursorPosition | null;
}

export interface OperatorSyncChange {
  sequenceId: bigint;
  entityType: string;
  entityId: bigint;
  operation: 'CREATE' | 'UPDATE' | 'DELETE';
  changedAt: Date;
  data: Record<string, unknown>;
}

export interface SyncChangePage {
  items: OperatorSyncChange[];
  hasMore: boolean;
  nextSequence: bigint | null;
}

export interface ReadingWithContractDetail {
  lecturaId: bigint;
  fecha: Date;
  lecturaAnterior: number;
  lecturaActual: number;
  consumoCalculado: number;
  descripcionAnomalia: string | null;
  fechaValidacion: Date | null;
  evidenciaFotoUrl: string | null;
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
        estadoServicio: string;
        comunidadId: number;
        sectorId: number | null;
        cliente: { nombres: string; apellidos: string };
      } | null;
    }>;
  } | null;
  updatedAt: Date;
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
  serie?: string;
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
    latitud?: number | null;
    longitud?: number | null;
    cliente: {
      nombres: string;
      apellidos: string;
      razonSocial: string | null;
    };
  };
  medidor: {
    medidorId: bigint;
    serie: string;
  } | null;
}

export interface OperatorRoute {
  rutaId: bigint;
  nombre: string;
  descripcion: string | null;
  operarioId: number;
  tipoRuta: string;
  comunidadId: number;
  comunidadNombre?: string | null;
  sectorId: number | null;
  sectorNombre?: string | null;
  periodoId: number | null;
  estado: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  operario?: {
    usuarioId: number;
    nombres: string;
    apellidos: string;
  } | null;
  medidor?: {
    medidorId: bigint;
    serie: string;
  } | null;
  ordenesTrabajo: OperatorWorkOrder[];
  paradas: OperatorRouteStop[];
}

export interface ReadingWithAnomalies {
  lecturaId: bigint;
  updatedAt: Date;
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
  novedadesOrdenTrabajo?: Array<{
    novedadId: bigint;
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
