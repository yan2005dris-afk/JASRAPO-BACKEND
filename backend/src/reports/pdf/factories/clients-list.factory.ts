import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { resolveClientName } from 'src/infrastructure/pdf/utils/pdf-format.utils';

export type ClientsListStyle = 'legacy' | 'modern';

export function createClientsListPdfDocumentType(
  style: ClientsListStyle,
): PdfDocumentType {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'clients-list-legacy' : 'clients-list-modern',
    name: isLegacy
      ? 'Listado de Clientes (Legacy)'
      : 'Listado de Clientes (Moderno)',
    template: isLegacy ? 'clients-list-legacy' : 'clients-list-modern',

    adaptData(raw: Record<string, unknown>): Record<string, unknown> {
      const clientes = (
        (raw['clientes'] as Record<string, unknown>[]) ?? []
      ).map((c) => ({
        identificacion: c['identificacion'] ?? '',
        nombre: resolveClientName(c as any),
        email: c['email'] ?? '—',
        telefono: c['telefono'] ?? '—',
        direccion: c['direccionDomicilio'] ?? '—',
        activo: c['activo'] ? 'Activo' : 'Inactivo',
        tipoId:
          (c['tipoIdentificacion'] as Record<string, unknown> | null)?.[
            'descripcion'
          ] ?? '—',
      }));

      return {
        reporte: {
          titulo: 'Listado de Clientes',
          fecha: raw['fecha'] ?? new Date().toLocaleDateString('es-EC'),
          filtrosAplicados: raw['filtrosAplicados'] ?? '',
          totalClientes: clientes.length,
          clientes,
        },
      };
    },
  };
}
