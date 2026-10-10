import { Injectable } from '@nestjs/common';
import { InstitutionalProfileResolver } from 'src/institutional-profile/application/institutional-profile.resolver';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';
import { attachInstitutionalProfile } from '../models/institutional-report';
import type { ProjectedReport } from '../models/report-projection';
import type { ReportRequestContext } from '../models/report-request-context';
import { ZoneConsumptionReportQueryPort } from '../ports/report-query.ports';
import {
  ESTIMATED_READING_STATE,
  MEASURED_READING_STATES,
  ZONE_CONSUMPTION_DEFINITIONS_VERSION,
  type ZoneConsumptionItem,
  type ZoneConsumptionReportDocument,
  type ZoneConsumptionReportFilters,
  type ZoneConsumptionReportFiltrosSummary,
  type ZoneConsumptionReportReadModel,
} from '../read-models/zone-consumption.read-model';

interface ZoneAccumulator {
  sectorId: number | null;
  sectorNombre: string;
  comunidadNombre: string;
  consumoTotalNum: number;
  medidoresConLectura: Set<string>;
  medidoresConAlgunaLectura: Set<string>;
  estimadasCount: number;
  estimadasVolumenNum: number;
}

const MEASURED_STATES: readonly string[] = MEASURED_READING_STATES;

function sectorKey(sectorId: number | null): string {
  return sectorId === null ? 'sin-sector' : String(sectorId);
}

function describeFiltros(
  filters: ZoneConsumptionReportFilters,
  periodoNombre: string,
): ZoneConsumptionReportFiltrosSummary {
  let descripcion = 'Todas las zonas';
  if (filters.sectorId) descripcion = 'Sector específico';
  else if (filters.comunidadId) descripcion = 'Comunidad específica';

  return {
    descripcion,
    periodoNombre,
    periodoId: filters.periodoId,
    comunidadId: filters.comunidadId,
    sectorId: filters.sectorId,
    definicionesVersion: ZONE_CONSUMPTION_DEFINITIONS_VERSION,
  };
}

export function projectZoneConsumptionReport(
  readModel: ZoneConsumptionReportReadModel,
  filters: ZoneConsumptionReportFilters = {},
): ProjectedReport<ZoneConsumptionReportDocument> {
  const periodoNombre = readModel.periodo?.nombre ?? '—';
  const zones = new Map<string, ZoneAccumulator>();

  const ensureZone = (
    sectorId: number | null,
    sectorNombre: string,
    comunidadNombre: string,
  ): ZoneAccumulator => {
    const key = sectorKey(sectorId);
    let zone = zones.get(key);
    if (!zone) {
      zone = {
        sectorId,
        sectorNombre,
        comunidadNombre,
        consumoTotalNum: 0,
        medidoresConLectura: new Set<string>(),
        medidoresConAlgunaLectura: new Set<string>(),
        estimadasCount: 0,
        estimadasVolumenNum: 0,
      };
      zones.set(key, zone);
    }
    return zone;
  };

  // 1) Consumo medido y estimadas a partir de las lecturas del periodo.
  for (const reading of readModel.readings) {
    const zone = ensureZone(
      reading.sectorId,
      reading.sectorNombre,
      reading.comunidadNombre,
    );
    zone.medidoresConAlgunaLectura.add(reading.medidorId);
    if (MEASURED_STATES.includes(reading.estado)) {
      zone.consumoTotalNum += reading.consumo;
      zone.medidoresConLectura.add(reading.medidorId);
    } else if (reading.estado === ESTIMATED_READING_STATE) {
      zone.estimadasCount += 1;
      zone.estimadasVolumenNum += reading.consumo;
    }
  }

  // 2) Medidores sin lectura: contratos ACTIVO cuyo medidor vigente no tiene
  //    ninguna lectura del periodo (brecha, no se estima).
  const sinLecturaByZone = new Map<string, number>();
  for (const contract of readModel.activeContracts) {
    const zone = ensureZone(
      contract.sectorId,
      contract.sectorNombre,
      contract.comunidadNombre,
    );
    const tieneLectura =
      contract.medidorId !== null &&
      zone.medidoresConAlgunaLectura.has(contract.medidorId);
    if (!tieneLectura) {
      const key = sectorKey(contract.sectorId);
      sinLecturaByZone.set(key, (sinLecturaByZone.get(key) ?? 0) + 1);
    }
  }

  const consumoTotalSistema = Array.from(zones.values()).reduce(
    (sum, zone) => sum + zone.consumoTotalNum,
    0,
  );

  const data: ZoneConsumptionItem[] = Array.from(zones.entries())
    .map(([key, zone]) => {
      const medidoresConLectura = zone.medidoresConLectura.size;
      const promedio =
        medidoresConLectura > 0
          ? zone.consumoTotalNum / medidoresConLectura
          : 0;
      const porcentaje =
        consumoTotalSistema > 0
          ? (zone.consumoTotalNum / consumoTotalSistema) * 100
          : 0;
      return {
        sectorId: key,
        sectorNombre: zone.sectorNombre,
        comunidadNombre: zone.comunidadNombre,
        consumoTotal: zone.consumoTotalNum.toFixed(2),
        consumoTotalNum: zone.consumoTotalNum,
        medidoresConLectura,
        consumoPromedio: promedio.toFixed(2),
        estimadasCount: zone.estimadasCount,
        estimadasVolumen: zone.estimadasVolumenNum.toFixed(2),
        medidoresSinLectura: sinLecturaByZone.get(key) ?? 0,
        porcentajeSistema: porcentaje.toFixed(1),
      };
    })
    .sort((left, right) => right.consumoTotalNum - left.consumoTotalNum);

  const medidoresSinLecturaTotal = Array.from(sinLecturaByZone.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  return {
    document: {
      data,
      meta: {
        total: data.length,
        periodoNombre,
      },
      kpis: {
        consumoTotalSistema: consumoTotalSistema.toFixed(2),
        totalZonas: data.length,
        zonaMayorConsumo: data[0]?.sectorNombre ?? '—',
        medidoresSinLectura: medidoresSinLecturaTotal,
      },
      filtros: describeFiltros(filters, periodoNombre),
    },
    recipientEmail: null,
  };
}

@Injectable()
export class ZoneConsumptionReportDefinition {
  constructor(
    private readonly queryPort: ZoneConsumptionReportQueryPort,
    private readonly institutionalProfiles: InstitutionalProfileResolver,
  ) {}

  async generate(
    context: ReportRequestContext<ZoneConsumptionReportFilters>,
  ): Promise<ProjectedReport<OfficialDocument<ZoneConsumptionReportDocument>>> {
    const [readModel, institutional] = await Promise.all([
      this.queryPort.query(context),
      this.institutionalProfiles.resolve(new Date()),
    ]);
    return attachInstitutionalProfile(
      projectZoneConsumptionReport(readModel, context.filters),
      institutional,
    );
  }
}
