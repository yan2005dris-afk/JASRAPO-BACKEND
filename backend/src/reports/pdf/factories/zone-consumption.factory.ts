import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import type {
  ZoneConsumptionItem,
  ZoneConsumptionReportDocument,
} from '../../application/read-models/zone-consumption.read-model';

export type ZoneConsumptionStyle = 'legacy' | 'modern';

interface ZoneConsumptionPdfRow extends ZoneConsumptionItem {
  tieneEstimadas: boolean;
  tieneFaltantes: boolean;
}

export type ZoneConsumptionPdfViewModel = Omit<
  ZoneConsumptionReportDocument,
  'data'
> & {
  titulo: string;
  data: ZoneConsumptionPdfRow[];
};

/**
 * Tipo de documento PDF del reporte de Consumo por Zonas (PDF-11, prototipo).
 * `adaptData` solo precomputa etiquetas/flags de presentación: sin cálculos de
 * negocio (los prohíbe `pdfAdapterContainsNoBusinessCalculations`).
 */
export function createZoneConsumptionPdfDocumentType(
  style: ZoneConsumptionStyle,
): PdfDocumentType<ZoneConsumptionReportDocument, ZoneConsumptionPdfViewModel> {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'zone-consumption-legacy' : 'zone-consumption-modern',
    name: isLegacy
      ? 'Consumo por Zonas (Legacy)'
      : 'Consumo por Zonas (Moderno)',
    template: isLegacy ? 'zone-consumption-legacy' : 'zone-consumption-modern',
    adaptData: (document) => ({
      ...document,
      titulo: isLegacy ? 'REPORTE DE CONSUMO POR ZONAS' : 'Consumo por Zonas',
      data: document.data.map((item) => ({
        ...item,
        tieneEstimadas: item.estimadasCount > 0,
        tieneFaltantes: item.medidoresSinLectura > 0,
      })),
    }),
  };
}
