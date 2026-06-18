import * as fs from 'node:fs';
import * as path from 'node:path';
import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import {
  formatDate,
  formatMonthYear,
  formatCurrency,
  formatDateInWords,
  resolveClientName,
} from 'src/infrastructure/pdf/utils/pdf-format.utils';

let cachedLogoUrl: string | null = null;
function getLogoUrl(): string {
  if (cachedLogoUrl) return cachedLogoUrl;
  try {
    let logoPath = path.join(
      __dirname,
      '..',
      '..',
      'infrastructure',
      'pdf',
      'assets',
      'Logo.jpeg',
    );
    if (!fs.existsSync(logoPath)) {
      logoPath = path.join(
        process.cwd(),
        'src',
        'infrastructure',
        'pdf',
        'assets',
        'Logo.jpeg',
      );
    }
    const imageBuffer = fs.readFileSync(logoPath);
    cachedLogoUrl = `data:image/jpeg;base64,${imageBuffer.toString('base64')}`;
  } catch (error) {
    cachedLogoUrl = '';
  }
  return cachedLogoUrl;
}

export const PaymentAgreementLegacyPdfDocumentType: PdfDocumentType = {
  type: 'payment-agreement-legacy',
  name: 'Convenio de Pago (Legacy)',
  template: 'payment-agreement-legacy',

  adaptData(raw: Record<string, any>): Record<string, any> {
    const c = raw.convenio ?? raw;
    const cliente = c.cliente ?? {};
    const contrato = c.contrato ?? {};

    return {
      logoUrl: getLogoUrl(),
      convenio: {
        fecha: formatDate(c.createdAt),
        numeroGuia: contrato.numeroGuia ?? '',
        clienteNombre: resolveClientName(cliente),
        clienteCI: cliente.identificacion ?? '',
        cuotaMensual: formatCurrency(Number(c.cuotaMensual ?? 0)),
        deudaTotal: formatCurrency(Number(c.deudaTotal ?? 0)),
        abonoInicial: formatCurrency(Number(c.abonoInicial ?? 0)),
        numeroCuotas: c.numeroCuotas ?? 0,
        mesPrimerPago: formatMonthYear(c.fechaPrimerPago),
        fechaActual: formatDateInWords(c.createdAt),
      },
    };
  },
};
