import type { PdfDocumentType } from '../../../infrastructure/pdf/document-type.interface';
import {
  formatDate,
  formatMonthYear,
  formatCurrency,
  formatDateInWords,
  resolveClientName,
} from '../../../infrastructure/pdf/utils/pdf-format.utils';
import { getPdfLogoUrl } from '../../../infrastructure/pdf/utils/pdf-logo-loader.util';

/**
 * Style discriminator passed to `createPaymentAgreementPdfDocumentType`.
 * Mirrors the values persisted in `sistema_config` and the suffixes of
 * the registered pdf-type keys (`payment-agreement-{style}`).
 */
export type PaymentAgreementStyle = 'legacy' | 'modern';

/**
 * Shape of the data returned by `GetPaymentAgreementPdfDataUseCase.execute(...)`.
 * The factory adapts this single shape to both legacy and modern pdf-types;
 * the `periodoInicio` field is the only legacy-vs-modern discriminator.
 *
 * The legacy `PaymentAgreementLegacyReportSpec` shape
 * (`{ convenio: { ...convenio, cuotaMensual, cliente } }`) is NO LONGER
 * supported by this factory — see H11 in the SDD spec.
 */
export interface PaymentAgreementPdfRawData {
  convenio: {
    createdAt: string;
    fechaInicio: string;
    fechaPrimerPago: string;
    cuotaMensual: number | string;
    deudaTotal: number | string;
    abonoInicial: number | string;
    numeroCuotas: number;
    cliente: {
      nombres?: string | null;
      apellidos?: string | null;
      razonSocial?: string | null;
      identificacion?: string | null;
    };
    contrato: {
      numeroGuia?: string | null;
    };
  };
}

/**
 * Factory that produces the legacy-or-modern pdf-type for the
 * `payment-agreement` report.
 *
 * Replaces the two near-identical files that used to live at
 * `payment-agreement-legacy.pdf-type.ts` and
 * `payment-agreement-modern.pdf-type.ts`. The `adaptData` body is the
 * shared one — only `periodoInicio` (legacy only) and `name` differ.
 *
 * Pre-PR2 the source files also supported a "raw at the root" fallback
 * (`raw.convenio ?? raw`); the factory keeps that fallback for safety
 * even though the `GetPaymentAgreementPdfDataUseCase` always wraps in
 * `convenio`.
 */
export function createPaymentAgreementPdfDocumentType(
  style: PaymentAgreementStyle,
): PdfDocumentType {
  const isLegacy = style === 'legacy';

  return {
    type: isLegacy ? 'payment-agreement-legacy' : 'payment-agreement-modern',
    name: isLegacy ? 'Convenio de Pago (Legacy)' : 'Acuerdo de Pago (Moderno)',
    template: isLegacy
      ? 'payment-agreement-legacy'
      : 'payment-agreement-modern',

    adaptData(raw: Record<string, unknown>): Record<string, unknown> {
      const root = raw as unknown as PaymentAgreementPdfRawData | undefined;
      const c = (root?.convenio ??
        (raw as unknown as Omit<
          PaymentAgreementPdfRawData['convenio'],
          'contrato' | 'cliente'
        >)) as PaymentAgreementPdfRawData['convenio'] | undefined;

      const cliente = c?.cliente ?? {};
      const contrato = c?.contrato ?? {};
      const createdAt = c?.createdAt ?? (raw['createdAt'] as string);
      const fechaInicio = (c?.fechaInicio ??
        raw['fechaInicio'] ??
        createdAt) as string;

      return {
        logoUrl: getPdfLogoUrl(),
        convenio: {
          fecha: formatDate(createdAt),
          numeroGuia: contrato.numeroGuia ?? '',
          clienteNombre: resolveClientName(cliente),
          clienteCI: cliente.identificacion ?? '',
          cuotaMensual: formatCurrency(Number(c?.cuotaMensual ?? 0)),
          deudaTotal: formatCurrency(Number(c?.deudaTotal ?? 0)),
          abonoInicial: formatCurrency(Number(c?.abonoInicial ?? 0)),
          numeroCuotas: c?.numeroCuotas ?? 0,
          mesPrimerPago: formatMonthYear(c?.fechaPrimerPago ?? createdAt),
          ...(isLegacy ? { periodoInicio: formatMonthYear(fechaInicio) } : {}),
          fechaActual: formatDateInWords(createdAt),
        },
      };
    },
  };
}
