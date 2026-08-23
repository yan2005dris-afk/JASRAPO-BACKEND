import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import type { ClientsListReportDocument } from '../../application/read-models/clients-list.read-model';

export type ClientsListStyle = 'legacy' | 'modern';

export function createClientsListPdfDocumentType(
  style: ClientsListStyle,
): PdfDocumentType<ClientsListReportDocument, ClientsListReportDocument> {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'clients-list-legacy' : 'clients-list-modern',
    name: isLegacy
      ? 'Listado de Clientes (Legacy)'
      : 'Listado de Clientes (Moderno)',
    template: isLegacy ? 'clients-list-legacy' : 'clients-list-modern',
    adaptData: (document) => document,
  };
}
