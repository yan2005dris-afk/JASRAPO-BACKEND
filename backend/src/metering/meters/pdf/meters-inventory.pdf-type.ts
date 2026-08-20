import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { currentDateLabel } from 'src/infrastructure/pdf/utils/pdf-format.utils';
import { getPdfLogoUrl } from 'src/infrastructure/pdf/utils/pdf-logo-loader.util';
import { METER_STATUS_LIST } from 'src/infrastructure/config/app.constants';
import { EstadoMedidor } from 'src/shared/enums';

interface MeterInventoryRow {
  serie?: string | null;
  marca?: string | null;
  modelo?: string | null;
  estado?: string | null;
  contratoId?: bigint | number | null;
  clienteNombre?: string | null;
}

interface MeterInventoryFilters {
  estado?: string | null;
  search?: string | null;
}

const STATUS_LABELS = new Map(
  METER_STATUS_LIST.map((state) => [state.codigo, state.nombre]),
);

function statusLabel(estado?: string | null): string {
  const codigo = estado ?? '';
  return STATUS_LABELS.get(codigo) ?? codigo;
}

function buildFiltersLabel(filtros: MeterInventoryFilters): string {
  const applied: string[] = [];
  if (filtros.estado) {
    applied.push(`Estado: ${statusLabel(filtros.estado)}`);
  }
  if (filtros.search) {
    applied.push(`Búsqueda: ${filtros.search}`);
  }
  return applied.length > 0 ? applied.join(' · ') : 'Sin filtros aplicados';
}

export const MetersInventoryPdfDocumentType: PdfDocumentType = {
  type: 'meters-inventory',
  name: 'Inventario de Medidores',
  template: 'meters-inventory',

  adaptData(raw: Record<string, unknown>): Record<string, unknown> {
    const source = (raw['medidores'] as MeterInventoryRow[]) ?? [];
    const filtros = (raw['filtros'] as MeterInventoryFilters) ?? {};

    const medidores = source.map((m) => ({
      serie: m.serie ?? '—',
      marca: m.marca ?? '—',
      modelo: m.modelo ?? '—',
      estado: m.estado ?? '',
      estadoLabel: statusLabel(m.estado),
      contrato: m.contratoId == null ? '—' : m.contratoId.toString(),
      cliente: m.clienteNombre ?? 'Sin asignar',
    }));

    const totalPorEstado = medidores.reduce<Record<string, number>>(
      (totals, medidor) => {
        totals[medidor.estado] = (totals[medidor.estado] ?? 0) + 1;
        return totals;
      },
      {},
    );

    return {
      logoUrl: getPdfLogoUrl(),
      reporte: {
        titulo: 'Inventario de Medidores',
        fechaEmision: currentDateLabel(),
        filtrosAplicados: buildFiltersLabel(filtros),
        total: medidores.length,
        kpis: [
          {
            label: 'En bodega',
            value: totalPorEstado[EstadoMedidor.BODEGA] ?? 0,
          },
          {
            label: 'Instalados',
            value: totalPorEstado[EstadoMedidor.INSTALADO] ?? 0,
          },
          {
            label: 'Dañados',
            value: totalPorEstado[EstadoMedidor.DANADO] ?? 0,
          },
        ],
        medidores,
      },
    };
  },
};
