import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { after, before, describe, it } from 'node:test';

import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';
import { PdfService } from 'src/infrastructure/pdf/pdf.service';
import { PreInvoicePdfDocumentType } from 'src/billing/pre-invoice/pdf/pre-invoice.pdf-type';
import { MetersInventoryPdfDocumentType } from 'src/metering/meters/pdf/meters-inventory.pdf-type';
import { ConnectionRequestPdfDocumentType } from 'src/operations/contracts/pdf/connection-request.pdf-type';
import { ResponsibilityAgreementPdfDocumentType } from 'src/operations/contracts/pdf/responsibility-agreement.pdf-type';
import { FieldSheetPdfDocumentType } from 'src/operations/routes/pdf/field-sheet.pdf-type';
import { SriDocumentPdfType } from 'src/sri/emision/infrastructure/pdf/sri-document.pdf-type';
import { REPORT_PDF_DOCUMENT_TYPES } from 'src/reports/pdf/report-pdf-document-types';
import { REPORT_TEMPLATE_FIXTURES } from 'src/reports/pdf/fixtures/report-template.fixture';

interface ChromiumSmokeFixture {
  documentType: PdfDocumentType<never, object>;
  data: object;
}

const REPORT_SMOKE_FIXTURES: readonly ChromiumSmokeFixture[] =
  REPORT_PDF_DOCUMENT_TYPES.map((documentType) => ({
    documentType,
    data: REPORT_TEMPLATE_FIXTURES.find(
      ({ type }) => type === documentType.type,
    )!.data,
  }));

const STANDALONE_SMOKE_FIXTURES: readonly ChromiumSmokeFixture[] = [
  smokeFixture(PreInvoicePdfDocumentType, {
    prefacturaId: 1,
    clienteNombre: 'Ana Pérez',
    clienteIdentificacion: '0912345678',
    clienteDireccion: 'Olón',
    clienteEmail: 'ana@example.com',
    subtotal: 10,
    iva: 0,
    descuentoTotal: 0,
    totalPagar: 10,
    interesMora: 0,
    deudaAnterior: 0,
    createdAt: '2024-05-20',
    numeroGuia: 'G-001',
    periodoNombre: 'MAYO 2024',
    fechaVencimiento: '2024-05-31',
    detalles: [
      {
        descripcion: 'Consumo de agua potable',
        cantidad: 1,
        precioUnitario: 10,
        subtotal: 10,
        iva: 0,
        total: 10,
      },
    ],
  }),
  smokeFixture(MetersInventoryPdfDocumentType, {
    filtros: { estado: 'BODEGA' },
    medidores: [
      {
        serie: 'M-001',
        marca: 'AquaMeter',
        modelo: 'R1',
        estado: 'BODEGA',
        contratoId: null,
        clienteNombre: null,
      },
    ],
  }),
  smokeFixture(ConnectionRequestPdfDocumentType, {
    numero: 'SOL-001',
    cliente: {
      nombres: 'Ana',
      apellidos: 'Pérez',
      identificacion: '0912345678',
      email: 'ana@example.com',
      telefono: '0999999999',
      direccionDomicilio: 'Olón',
    },
    contrato: {
      numeroGuia: 'G-001',
      direccionSuministro: 'Olón',
      fechaInicio: '2024-05-20',
      comunidad: { nombre: 'Olón' },
      sector: { nombre: 'Sector Norte' },
    },
    tarifa: {
      nombre: 'Residencial',
      tipo: 'DOMÉSTICA',
      valorBase: 4,
      consumoMinimoMensual: 10,
      valorExcedenteM3: 0.5,
    },
    costos: { derechoInspeccion: 3, total: 3 },
    fechaEmision: '2024-05-20',
  }),
  smokeFixture(ResponsibilityAgreementPdfDocumentType, {
    cliente: {
      nombres: 'Ana',
      apellidos: 'Pérez',
      identificacion: '0912345678',
    },
    fechaFirmado: '2024-05-20',
  }),
  smokeFixture(FieldSheetPdfDocumentType, {
    ruta: {
      rutaId: 1,
      nombre: 'Ruta Norte',
      tipoRuta: 'TOMA_LECTURA',
      estado: 'PLANIFICADA',
      fechaPlanificada: '2024-05-20',
      comunidadNombre: 'Olón',
      sectorNombre: 'Sector Norte',
      operarioNombre: 'Juan Operador',
      periodoNombre: 'MAYO 2024',
    },
    isLectura: true,
    items: [
      {
        ordenVisita: 1,
        guia: 'G-001',
        contrato: '10',
        cliente: 'Ana Pérez',
        direccion: 'Olón',
        medidor: 'M-001',
        lecturaAnterior: 100,
      },
    ],
    kpis: { total: 1, pendientes: 1, completadas: 0, conNovedad: 0 },
  }),
  smokeFixture(SriDocumentPdfType, {
    tipoDocumento: 'FACTURA',
    fechaAutorizacion: '2024-05-20 10:00:00',
    fechaEmision: '2024-05-20',
    emisor: { razonSocial: 'JASRAPO', ruc: '0999999999001' },
    comprador: { razonSocial: 'Ana Pérez', identificacion: '0912345678' },
    detalles: [
      {
        codigoPrincipal: 'AGUA',
        cantidad: 1,
        descripcion: 'Servicio de agua potable',
        precioUnitario: 10,
        precioTotalSinImpuesto: 10,
      },
    ],
    totalSinImpuestos: 10,
    importeTotal: 10,
  }),
];

void describe('real Chromium PDF contract', () => {
  const pdfService = new PdfService({
    concurrency: 2,
    maxQueueSize: 20,
    totalTimeoutMs: 120000,
    retryAfterSeconds: 5,
  });

  before(async () => {
    for (const { documentType } of [
      ...REPORT_SMOKE_FIXTURES,
      ...STANDALONE_SMOKE_FIXTURES,
    ]) {
      pdfService.registerDocumentType(documentType);
    }
    await pdfService.onApplicationBootstrap();
  });

  after(async () => pdfService.onApplicationShutdown());

  void it('allReportFamiliesRenderInRealChromium', async () => {
    for (const { documentType, data } of [
      ...REPORT_SMOKE_FIXTURES,
      ...STANDALONE_SMOKE_FIXTURES,
    ]) {
      const buffer = await pdfService.render(documentType.template, data, {
        documentType: documentType.type,
      });

      assert.equal(buffer.subarray(0, 4).toString('ascii'), '%PDF');
      assert.ok(buffer.length > 1_000);
      writeArtifact(documentType.type, buffer);
    }
  });
});

function smokeFixture<TInput, TOutput extends object>(
  documentType: PdfDocumentType<TInput, TOutput>,
  input: TInput,
): ChromiumSmokeFixture {
  return {
    documentType,
    data: documentType.adaptData(input),
  };
}

function writeArtifact(type: string, buffer: Buffer): void {
  const outputDirectory = process.env['PDF_CONTRACT_OUTPUT_DIR'];
  if (!outputDirectory) return;
  const resolvedDirectory = path.resolve(outputDirectory);
  fs.mkdirSync(resolvedDirectory, { recursive: true });
  fs.writeFileSync(path.join(resolvedDirectory, `${type}.pdf`), buffer);
}
