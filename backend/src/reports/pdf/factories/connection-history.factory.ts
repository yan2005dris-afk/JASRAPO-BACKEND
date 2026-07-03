import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import {
  currentDateLabel,
  resolveClientName,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';
import { getPdfLogoUrl } from 'src/infrastructure/pdf/utils/pdf-logo-loader.util';

/**
 * Style discriminator for connection-history reports.
 * Mirrors the values persisted in `sistema_config`.
 */
export type ConnectionHistoryStyle = 'legacy' | 'modern';

/**
 * Factory that produces the legacy-or-modern pdf-type for the
 * `connection-history` report.
 *
 * Replaces the two near-identical files at
 * `connection-history-legacy.pdf-type.ts` and
 * `connection-history-modern.pdf-type.ts`. The `adaptData` body is the
 * shared one — only `logoUrl` (modern only) and metadata differ.
 */
export function createConnectionHistoryPdfDocumentType(
  style: ConnectionHistoryStyle,
): PdfDocumentType {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'connection-history-legacy' : 'connection-history-modern',
    name: isLegacy
      ? 'Historial de Conexión (Legacy)'
      : 'Historial de Conexión (Moderno)',
    template: isLegacy
      ? 'connection-history-legacy'
      : 'connection-history-modern',

    adaptData(raw: Record<string, unknown>): Record<string, unknown> {
      const prefacturas =
        (raw['prefacturas'] as Record<string, unknown>[]) ?? [];

      // Extract header from first prefactura's contrato
      const first = prefacturas[0] as Record<string, unknown> | undefined;
      const contrato = first?.['contrato'] as
        | Record<string, unknown>
        | undefined;
      const cliente = contrato?.['cliente'] as
        | Record<string, unknown>
        | undefined;
      const medidorSerie = (
        contrato?.['historialMedidores'] as
          | Record<string, unknown>[]
          | undefined
      )?.[0]?.['medidor'] as Record<string, unknown> | undefined;

      const filas = prefacturas.map((pf) => {
        const periodo = pf['periodoRel'] as Record<string, unknown> | undefined;
        const emision = periodo?.['nombre'] ?? '—';
        const lectActual = Number(pf['lecturaActual'] ?? 0).toFixed(0);
        const lectAnterior = Number(pf['lecturaAnterior'] ?? 0).toFixed(0);
        const consumo = Number(pf['consumoM3'] ?? 0).toFixed(0);
        const valEmision = Number(pf['totalPagar'] ?? 0).toFixed(2);
        const abonos = Number(pf['abono'] ?? 0).toFixed(2);
        const saldo = Number(pf['saldoActual'] ?? 0).toFixed(2);

        return {
          emision,
          lectActual,
          lectAnterior,
          consumo,
          valEmision,
          abonos,
          saldo,
        };
      });

      // Totals
      const totalValEmision = prefacturas
        .reduce((s, pf) => s + Number(pf['totalPagar'] ?? 0), 0)
        .toFixed(2);
      const totalAbonos = prefacturas
        .reduce((s, pf) => s + Number(pf['abono'] ?? 0), 0)
        .toFixed(2);
      const saldoFinal =
        prefacturas.length > 0
          ? Number(
              prefacturas[prefacturas.length - 1]['saldoActual'] ?? 0,
            ).toFixed(2)
          : '0.00';

      return {
        ...(isLegacy ? {} : { logoUrl: getPdfLogoUrl() }),
        reporte: {
          titulo: isLegacy
            ? 'REPORTE HISTORIAL DE CONEXION'
            : 'Historial de Conexión Detallado',
          fechaEmision: currentDateLabel(),
          fechaDesde: raw['fechaDesde'] || '--',
          fechaHasta: raw['fechaHasta'] || '--',
          cuenta: raw['contratoId'] ?? '—',
          clienteNombre: cliente ? resolveClientName(cliente) : '—',
          medidor: (medidorSerie?.['serie'] as string) ?? '—',
          filas,
          totalValEmision,
          totalAbonos,
          saldoFinal,
        },
      };
    },
  };
}
