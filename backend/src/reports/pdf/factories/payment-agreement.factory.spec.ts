jest.mock('../../../infrastructure/pdf/utils/pdf-logo-loader.util', () => ({
  getPdfLogoUrl: jest.fn(() => '/static/logo.png'),
}));

import { createPaymentAgreementPdfDocumentType } from './payment-agreement.factory';
import type { PdfDocumentType } from '../../../infrastructure/pdf/document-type.interface';

describe('createPaymentAgreementPdfDocumentType', () => {
  describe('legacy variant', () => {
    let pdfType: PdfDocumentType;

    beforeEach(() => {
      pdfType = createPaymentAgreementPdfDocumentType('legacy');
    });

    it('exposes the legacy type/name/template identifiers', () => {
      expect(pdfType.type).toBe('payment-agreement-legacy');
      expect(pdfType.name).toBe('Convenio de Pago (Legacy)');
      expect(pdfType.template).toBe('payment-agreement-legacy');
    });

    it('exposes adaptData as a function', () => {
      expect(typeof pdfType.adaptData).toBe('function');
    });

    it('produces a convenio block with periodoInicio + all legacy fields', () => {
      const raw = {
        convenio: {
          createdAt: '2024-05-10T10:00:00.000Z',
          periodoInicio: '2024-05-01T00:00:00.000Z',
          fechaPrimerPago: '2024-06-01T00:00:00.000Z',
          cuotaMensual: 25.5,
          primeraCuota: 25.5,
          deudaTotal: 500,
          abonoInicial: 100,
          numeroCuotas: 12,
          cliente: {
            nombres: 'María',
            apellidos: 'Gómez',
            identificacion: '1791234567001',
          },
          contrato: {
            numeroGuia: 'G-001',
          },
        },
      };

      const result = pdfType.adaptData(raw) as Record<string, unknown>;
      expect(result['logoUrl']).toBe('/static/logo.png');
      const convenio = result['convenio'] as Record<string, unknown>;
      expect(convenio['clienteNombre']).toBe('María Gómez');
      expect(convenio['clienteCI']).toBe('1791234567001');
      expect(convenio['cuotaMensual']).toBe('25.50');
      expect(convenio['primeraCuota']).toBe('25.50');
      expect(convenio['deudaTotal']).toBe('500.00');
      expect(convenio['abonoInicial']).toBe('100.00');
      expect(convenio['numeroCuotas']).toBe(12);
      expect(convenio['numeroGuia']).toBe('G-001');
      expect(convenio['periodoInicio']).toEqual(expect.any(String));
      expect(convenio['fechaActual']).toEqual(expect.any(String));
      expect(convenio['fecha']).toEqual(expect.any(String));
      expect(convenio['mesPrimerPago']).toEqual(expect.any(String));
      // Legacy keeps periodoInicio defined.
      expect(convenio['periodoInicio']).toBeDefined();
    });

    it('falls back to a flat raw object when raw.convenio is missing', () => {
      const flatRaw = {
        createdAt: '2024-05-10T10:00:00.000Z',
        periodoInicio: '2024-05-01T00:00:00.000Z',
        fechaPrimerPago: '2024-06-01T00:00:00.000Z',
        cuotaMensual: 10,
        primeraCuota: 10,
        deudaTotal: 0,
        abonoInicial: 0,
        numeroCuotas: 1,
        cliente: { razonSocial: 'Acme S.A.' },
        contrato: {},
      };

      const result = pdfType.adaptData(flatRaw) as Record<string, unknown>;
      const convenio = result['convenio'] as Record<string, unknown>;
      expect(convenio['clienteNombre']).toBe('Acme S.A.');
      expect(convenio['periodoInicio']).toEqual(expect.any(String));
    });
  });

  describe('modern variant', () => {
    let pdfType: PdfDocumentType;

    beforeEach(() => {
      pdfType = createPaymentAgreementPdfDocumentType('modern');
    });

    it('exposes the modern type/name/template identifiers', () => {
      expect(pdfType.type).toBe('payment-agreement-modern');
      expect(pdfType.name).toBe('Acuerdo de Pago (Moderno)');
      expect(pdfType.template).toBe('payment-agreement-modern');
    });

    it('exposes adaptData as a function', () => {
      expect(typeof pdfType.adaptData).toBe('function');
    });

    it('produces a convenio block without periodoInicio (modern omits it)', () => {
      const raw = {
        convenio: {
          createdAt: '2024-05-10T10:00:00.000Z',
          periodoInicio: '2024-05-01T00:00:00.000Z',
          fechaPrimerPago: '2024-06-01T00:00:00.000Z',
          cuotaMensual: 25.5,
          primeraCuota: 25.5,
          deudaTotal: 500,
          abonoInicial: 100,
          numeroCuotas: 12,
          cliente: {
            razonSocial: 'Beta S.A.',
            identificacion: '1791234567002',
          },
          contrato: { numeroGuia: 'G-200' },
        },
      };

      const result = pdfType.adaptData(raw) as Record<string, unknown>;
      expect(result['logoUrl']).toBe('/static/logo.png');
      const convenio = result['convenio'] as Record<string, unknown>;
      expect(convenio['clienteNombre']).toBe('Beta S.A.');
      expect(convenio['clienteCI']).toBe('1791234567002');
      expect(convenio['cuotaMensual']).toBe('25.50');
      expect(convenio['numeroGuia']).toBe('G-200');
      expect(convenio['numeroCuotas']).toBe(12);
      // Modern omits periodoInicio.
      expect(convenio['periodoInicio']).toBeUndefined();
    });
  });

  describe('unique (canonical) variant', () => {
    let pdfType: PdfDocumentType;

    beforeEach(() => {
      pdfType = createPaymentAgreementPdfDocumentType('unique');
    });

    it('exposes the canonical type/name and reuses the legacy template', () => {
      expect(pdfType.type).toBe('payment-agreement-unique');
      expect(pdfType.name).toBe('Convenio de Pago');
      // Canonical reuses the legacy layout for now (finalized with the team).
      expect(pdfType.template).toBe('payment-agreement-legacy');
    });

    it('keeps periodoInicio (shares the legacy data shape)', () => {
      const raw = {
        convenio: {
          createdAt: '2024-05-10T10:00:00.000Z',
          periodoInicio: '2024-05-01T00:00:00.000Z',
          fechaPrimerPago: '2024-06-01T00:00:00.000Z',
          cuotaMensual: 25.5,
          primeraCuota: 25.5,
          deudaTotal: 500,
          abonoInicial: 100,
          numeroCuotas: 12,
          cliente: { nombres: 'Ana', apellidos: 'Pérez' },
          contrato: { numeroGuia: 'G-777' },
        },
      };

      const result = pdfType.adaptData(raw) as Record<string, unknown>;
      const convenio = result['convenio'] as Record<string, unknown>;
      expect(convenio['clienteNombre']).toBe('Ana Pérez');
      expect(convenio['numeroGuia']).toBe('G-777');
      expect(convenio['periodoInicio']).toEqual(expect.any(String));
    });
  });

  it('paymentAgreementUsesContractualStartPeriod', () => {
    const pdfType = createPaymentAgreementPdfDocumentType('legacy');
    const result = pdfType.adaptData({
      convenio: {
        createdAt: '2024-05-10T10:00:00.000Z',
        periodoInicio: '2023-02-01T00:00:00.000Z',
        fechaPrimerPago: '2024-06-01T00:00:00.000Z',
        cuotaMensual: 25,
        primeraCuota: 25,
        deudaTotal: 100,
        abonoInicial: 10,
        numeroCuotas: 4,
        cliente: {},
        contrato: {},
      },
    });

    const convenio = result['convenio'] as Record<string, unknown>;
    expect(convenio['periodoInicio']).toBe('febrero de 2023');
    expect(convenio['periodoInicio']).not.toBe('mayo de 2024');
  });

  it('paymentAgreementUsesContractualFirstInstallmentConcept', () => {
    const pdfType = createPaymentAgreementPdfDocumentType('legacy');
    const result = pdfType.adaptData({
      convenio: {
        createdAt: '2024-05-10T10:00:00.000Z',
        periodoInicio: '2023-02-01T00:00:00.000Z',
        fechaPrimerPago: '2024-06-01T00:00:00.000Z',
        cuotaMensual: 25,
        primeraCuota: 25,
        deudaTotal: 100,
        abonoInicial: 10,
        numeroCuotas: 4,
        cliente: {},
        contrato: {},
      },
    });

    const convenio = result['convenio'] as Record<string, unknown>;
    expect(convenio['primeraCuota']).toBe('25.00');
    expect(convenio['primeraCuota']).not.toBe(convenio['abonoInicial']);
  });

  describe('factory discrimination', () => {
    it('returns different name and template for each style', () => {
      const legacy = createPaymentAgreementPdfDocumentType('legacy');
      const modern = createPaymentAgreementPdfDocumentType('modern');

      expect(legacy.type).not.toBe(modern.type);
      expect(legacy.template).not.toBe(modern.template);
      expect(legacy.name).not.toBe(modern.name);
      expect(legacy.name).toContain('Legacy');
      expect(modern.name).toContain('Moderno');
    });
  });
});
