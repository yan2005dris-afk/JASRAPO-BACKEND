import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import type { OfficialDocument } from 'src/institutional-profile/domain/institutional-profile.types';
import type {
  OverdueAccountItem,
  OverdueAccountsReportDocument,
} from '../../application/read-models/overdue-accounts.read-model';

export type OverdueAccountsStyle = 'legacy' | 'modern';

type OverdueAccountsDocument = OfficialDocument<OverdueAccountsReportDocument>;

interface OverdueAccountsPdfRow extends OverdueAccountItem {
  mesesLabel: string;
  severidadCritica: boolean;
}

export type OverdueAccountsPdfViewModel = Omit<
  OverdueAccountsDocument,
  'data'
> & {
  titulo: string;
  data: OverdueAccountsPdfRow[];
};

export function createOverdueAccountsPdfDocumentType(
  style: OverdueAccountsStyle,
): PdfDocumentType<OverdueAccountsDocument, OverdueAccountsPdfViewModel> {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'overdue-accounts-legacy' : 'overdue-accounts-modern',
    name: isLegacy
      ? 'Recaudación y Morosidad (Legacy)'
      : 'Recaudación y Morosidad (Moderno)',
    template: isLegacy ? 'overdue-accounts-legacy' : 'overdue-accounts-modern',
    adaptData: (document) => ({
      ...document,
      titulo: isLegacy
        ? 'REPORTE DE RECAUDACIÓN Y MOROSIDAD'
        : 'Recaudación y Morosidad',
      // Se precomputan etiqueta y severidad por fila para no depender de helpers en la plantilla.
      data: document.data.map((item) => ({
        ...item,
        mesesLabel: `${item.mesesVencidos} ${item.mesesVencidos === 1 ? 'mes' : 'meses'}`,
        severidadCritica: item.mesesVencidos > 2,
      })),
    }),
  };
}
