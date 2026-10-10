/**
 * Read-model del reporte de Consumo por Zonas (PDF-11).
 *
 * PROTOTIPO — definiciones v0.1 (pendientes de aprobación formal de negocio,
 * ver ficha `PDF-11-definiciones-consumo-por-zonas`). Decisiones adoptadas:
 *  - Zona = Sector (`sectores`), agrupado por Comunidad (`comunidades`).
 *  - Periodo = un Periodo de facturación (`periodos`).
 *  - Consumo canónico = Σ `lecturas.consumo_calculado` (m³) de lecturas en
 *    estado APROBADA | PLANILLADA. ESTIMADA se reporta aparte. El resto se excluye.
 *  - "Medidores sin lectura" = contratos ACTIVO del sector sin lectura en el periodo
 *    (brecha, NO se estima).
 */

export const ZONE_CONSUMPTION_DEFINITIONS_VERSION = 'defs v0.1 (prototipo)';

/** Estados de lectura que suman al consumo medido oficial. */
export const MEASURED_READING_STATES = ['APROBADA', 'PLANILLADA'] as const;
/** Estado de lectura estimada (se reporta por separado). */
export const ESTIMATED_READING_STATE = 'ESTIMADA';

export interface ZoneConsumptionReportFilters {
  /** Periodo de facturación. Si se omite, se usa el más reciente CERRADO. */
  periodoId?: string;
  comunidadId?: string;
  sectorId?: string;
}

/** Una lectura del periodo, ya resuelta a su zona (sector/comunidad). */
export interface ZoneConsumptionReadingReadModel {
  sectorId: number | null;
  sectorNombre: string;
  comunidadNombre: string;
  medidorId: string;
  consumo: number;
  /** Estado de la lectura (`EstadoLectura`). */
  estado: string;
}

/** Un contrato ACTIVO en el alcance, con su medidor vigente (para "sin lectura"). */
export interface ZoneConsumptionActiveContractReadModel {
  sectorId: number | null;
  sectorNombre: string;
  comunidadNombre: string;
  /** Medidor vigente del contrato; null si no tiene medidor asignado. */
  medidorId: string | null;
}

export interface ZoneConsumptionReportReadModel {
  periodo: {
    id: number;
    nombre: string;
  } | null;
  readings: ZoneConsumptionReadingReadModel[];
  activeContracts: ZoneConsumptionActiveContractReadModel[];
}

/** Fila agregada por zona en el documento proyectado. */
export interface ZoneConsumptionItem {
  sectorId: string;
  sectorNombre: string;
  comunidadNombre: string;
  consumoTotal: string;
  consumoTotalNum: number;
  medidoresConLectura: number;
  consumoPromedio: string;
  estimadasCount: number;
  estimadasVolumen: string;
  medidoresSinLectura: number;
  porcentajeSistema: string;
}

export interface ZoneConsumptionReportFiltrosSummary {
  descripcion: string;
  periodoNombre: string;
  periodoId?: string;
  comunidadId?: string;
  sectorId?: string;
  /** Trazabilidad: versión de las definiciones/fórmulas usadas. */
  definicionesVersion: string;
}

export interface ZoneConsumptionReportDocument {
  data: ZoneConsumptionItem[];
  meta: {
    total: number;
    periodoNombre: string;
  };
  kpis: {
    consumoTotalSistema: string;
    totalZonas: number;
    zonaMayorConsumo: string;
    medidoresSinLectura: number;
  };
  filtros: ZoneConsumptionReportFiltrosSummary;
}
