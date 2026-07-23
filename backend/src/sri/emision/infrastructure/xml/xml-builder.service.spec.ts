import * as xml2js from 'xml2js';
import { BadRequestException } from '@nestjs/common';
import { XmlBuilderService } from './xml-builder.service';
import {
  FACTURA_VERSION,
  NOTA_CREDITO_VERSION,
  RETENCION_VERSION,
} from '../../domain/constants';
import { Ambiente, TipoEmision, TipoComprobante } from '../../domain/constants';
import type {
  Factura,
  InfoTributaria,
  NotaCredito,
  Retencion,
  ImpuestoRetenido,
} from '../../domain/interfaces';
import type { LoggerService } from 'src/infrastructure/observability/logger/logger.service';

const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

async function parseXml(xml: string): Promise<any> {
  const parser = new xml2js.Parser({
    explicitArray: false,
    ignoreAttrs: false,
  });
  return parser.parseStringPromise(xml);
}

const baseInfoTributaria = (codDoc: string): InfoTributaria => ({
  ambiente: Ambiente.PRUEBAS,
  tipoEmision: TipoEmision.NORMAL,
  razonSocial: 'Test Emisor S.A.',
  ruc: '1234567890001',
  claveAcceso: '0307202601123456789000110010010000000011234567812',
  codDoc: codDoc as any,
  estab: '001',
  ptoEmi: '001',
  secuencial: '000000001',
  dirMatriz: 'Av. Principal 123',
});

describe('XmlBuilderService', () => {
  let service: XmlBuilderService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new XmlBuilderService(mockLogger as unknown as LoggerService);
  });

  describe('buildFactura', () => {
    const buildFacturaFixture = (
      overrides: Partial<Factura> = {},
    ): Factura => ({
      infoTributaria: baseInfoTributaria(TipoComprobante.FACTURA),
      infoFactura: {
        fechaEmision: '03/07/2026',
        obligadoContabilidad: 'SI',
        tipoIdentificacionComprador: '05' as any,
        razonSocialComprador: 'Cliente Test',
        identificacionComprador: '1234567890',
        totalSinImpuestos: 100,
        totalDescuento: 0,
        totalConImpuestos: [
          {
            codigo: '2',
            codigoPorcentaje: '2',
            baseImponible: 100,
            tarifa: 12,
            valor: 12,
          },
        ],
        importeTotal: 112,
        pagos: [{ formaPago: '01' as any, total: 112 }],
      },
      detalles: [
        {
          codigoPrincipal: '001',
          descripcion: 'Producto Uno',
          cantidad: 1,
          precioUnitario: 100,
          descuento: 0,
          precioTotalSinImpuesto: 100,
          impuestos: [
            {
              codigo: '2',
              codigoPorcentaje: '2',
              tarifa: 12,
              baseImponible: 100,
              valor: 12,
            },
          ],
        },
        {
          codigoPrincipal: '002',
          descripcion: 'Producto Dos',
          cantidad: 2,
          precioUnitario: 50,
          descuento: 0,
          precioTotalSinImpuesto: 100,
          impuestos: [
            {
              codigo: '2',
              codigoPorcentaje: '2',
              tarifa: 12,
              baseImponible: 100,
              valor: 12,
            },
          ],
        },
      ],
      ...overrides,
    });

    it('produces a well-formed XML document with the root <factura> element and required attributes', async () => {
      const xml = service.buildFactura(buildFacturaFixture());
      const parsed = await parseXml(xml);

      expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"')).toBe(
        true,
      );
      expect(parsed.factura).toBeDefined();
      expect(parsed.factura.$.id).toBe('comprobante');
      expect(parsed.factura.$.version).toBe(FACTURA_VERSION);
    });

    it('includes every required infoTributaria node with correct values', async () => {
      const xml = service.buildFactura(buildFacturaFixture());
      const parsed = await parseXml(xml);
      const infoTributaria = parsed.factura.infoTributaria;

      expect(infoTributaria.ambiente).toBe(Ambiente.PRUEBAS);
      expect(infoTributaria.tipoEmision).toBe(TipoEmision.NORMAL);
      expect(infoTributaria.razonSocial).toBe('Test Emisor S.A.');
      expect(infoTributaria.ruc).toBe('1234567890001');
      expect(infoTributaria.claveAcceso).toHaveLength(49);
      expect(infoTributaria.codDoc).toBe(TipoComprobante.FACTURA);
      expect(infoTributaria.estab).toBe('001');
      expect(infoTributaria.ptoEmi).toBe('001');
      expect(infoTributaria.secuencial).toBe('000000001');
      expect(infoTributaria.dirMatriz).toBe('Av. Principal 123');
    });

    it('includes required infoFactura nodes with amounts formatted to 2 decimals', async () => {
      const xml = service.buildFactura(buildFacturaFixture());
      const parsed = await parseXml(xml);
      const infoFactura = parsed.factura.infoFactura;

      expect(infoFactura.fechaEmision).toBe('03/07/2026');
      expect(infoFactura.obligadoContabilidad).toBe('SI');
      expect(infoFactura.tipoIdentificacionComprador).toBe('05');
      expect(infoFactura.razonSocialComprador).toBe('Cliente Test');
      expect(infoFactura.identificacionComprador).toBe('1234567890');
      expect(infoFactura.totalSinImpuestos).toBe('100.00');
      expect(infoFactura.totalDescuento).toBe('0.00');
      expect(infoFactura.importeTotal).toBe('112.00');
      expect(infoFactura.totalConImpuestos.totalImpuesto).toMatchObject({
        codigo: '2',
        codigoPorcentaje: '2',
        baseImponible: '100.00',
        tarifa: '12.00',
        valor: '12.00',
      });
      expect(infoFactura.pagos.pago).toMatchObject({
        formaPago: '01',
        total: '112.00',
      });
    });

    it('serializes every detalle item as an array node when there are multiple', async () => {
      const xml = service.buildFactura(buildFacturaFixture());
      const parsed = await parseXml(xml);
      const detalles = parsed.factura.detalles.detalle;

      expect(Array.isArray(detalles)).toBe(true);
      expect(detalles).toHaveLength(2);
      expect(detalles[0]).toMatchObject({
        codigoPrincipal: '001',
        descripcion: 'Producto Uno',
        cantidad: '1.000000',
        precioUnitario: '100.000000',
        descuento: '0.00',
        precioTotalSinImpuesto: '100.00',
      });
      expect(detalles[0].impuestos.impuesto).toMatchObject({
        codigo: '2',
        codigoPorcentaje: '2',
        tarifa: '12.00',
        baseImponible: '100.00',
        valor: '12.00',
      });
    });

    it('omits the <retenciones> node when no retenciones are provided', async () => {
      const xml = service.buildFactura(buildFacturaFixture());
      const parsed = await parseXml(xml);

      expect(parsed.factura.retenciones).toBeUndefined();
    });

    it('includes the <retenciones> node when retenciones are provided', async () => {
      const xml = service.buildFactura(
        buildFacturaFixture({
          retenciones: [
            { codigo: '1', codigoPorcentaje: '303', tarifa: 1, valor: 1 },
          ],
        }),
      );
      const parsed = await parseXml(xml);

      expect(parsed.factura.retenciones.retencion).toMatchObject({
        codigo: '1',
        codigoPorcentaje: '303',
        tarifa: '1.00',
        valor: '1.00',
      });
    });

    it('includes infoAdicional campoAdicional nodes with nombre attribute and text value', async () => {
      const xml = service.buildFactura(
        buildFacturaFixture({
          infoAdicional: [{ nombre: 'email', valor: 'cliente@test.com' }],
        }),
      );
      const parsed = await parseXml(xml);
      const campo = parsed.factura.infoAdicional.campoAdicional;

      expect(campo.$.nombre).toBe('email');
      expect(campo._).toBe('cliente@test.com');
    });

    it('omits infoAdicional entirely when the list is empty', async () => {
      const xml = service.buildFactura(
        buildFacturaFixture({ infoAdicional: [] }),
      );
      const parsed = await parseXml(xml);

      expect(parsed.factura.infoAdicional).toBeUndefined();
    });
  });

  describe('buildNotaCredito', () => {
    const buildNotaCreditoFixture = (overrides: Partial<NotaCredito> = {}): NotaCredito => ({
      infoTributaria: baseInfoTributaria(TipoComprobante.NOTA_CREDITO),
      infoNotaCredito: {
        fechaEmision: '03/07/2026',
        tipoIdentificacionComprador: '05' as any,
        razonSocialComprador: 'Cliente Test',
        identificacionComprador: '1234567890',
        obligadoContabilidad: 'SI',
        codDocModificado: '01',
        numDocModificado: '001-001-000000001',
        fechaEmisionDocSustento: '01/07/2026',
        totalSinImpuestos: 100,
        valorModificacion: 112,
        totalConImpuestos: [
          {
            codigo: '2',
            codigoPorcentaje: '2',
            baseImponible: 100,
            valor: 12,
          },
        ],
        motivo: 'Devolución de producto',
      },
      detalles: [
        {
          codigoInterno: '001',
          descripcion: 'Producto Uno',
          cantidad: 1,
          precioUnitario: 100,
          descuento: 0,
          precioTotalSinImpuesto: 100,
          impuestos: [
            {
              codigo: '2',
              codigoPorcentaje: '2',
              tarifa: 12,
              baseImponible: 100,
              valor: 12,
            },
          ],
        },
      ],
      ...overrides,
    });

    it('produces a well-formed <notaCredito> document with required nodes', async () => {
      const xml = service.buildNotaCredito(buildNotaCreditoFixture());
      const parsed = await parseXml(xml);

      expect(parsed.notaCredito.$.id).toBe('comprobante');
      expect(parsed.notaCredito.$.version).toBe(NOTA_CREDITO_VERSION);
      expect(parsed.notaCredito.infoTributaria.codDoc).toBe(
        TipoComprobante.NOTA_CREDITO,
      );
      expect(parsed.notaCredito.infoNotaCredito).toMatchObject({
        motivo: 'Devolución de producto',
        codDocModificado: '01',
        numDocModificado: '001-001-000000001',
        totalSinImpuestos: '100.00',
        valorModificacion: '112.00',
      });
      expect(parsed.notaCredito.detalles.detalle).toMatchObject({
        codigoInterno: '001',
        descripcion: 'Producto Uno',
      });
    });

    it('includes infoAdicional on notaCredito when provided', async () => {
      const xml = service.buildNotaCredito(
        buildNotaCreditoFixture({
          infoAdicional: [{ nombre: 'Observacion', valor: 'Nota de credito test' }],
        }),
      );
      const parsed = await parseXml(xml);
      expect(parsed.notaCredito.infoAdicional.campoAdicional.$.nombre).toBe('Observacion');
      expect(parsed.notaCredito.infoAdicional.campoAdicional._).toBe('Nota de credito test');
    });
  });

  describe('buildNotaDebito', () => {
    const buildNotaDebitoFixture = (overrides: any = {}) => ({
      infoTributaria: baseInfoTributaria('05'),
      infoNotaDebito: {
        fechaEmision: '03/07/2026',
        tipoIdentificacionComprador: '05' as any,
        razonSocialComprador: 'Cliente Debito Test',
        identificacionComprador: '1234567890',
        obligadoContabilidad: 'SI',
        codDocModificado: '01',
        numDocModificado: '001-001-000000001',
        fechaEmisionDocSustento: '01/07/2026',
        totalSinImpuestos: 50,
        impuestos: [
          {
            codigo: '2',
            codigoPorcentaje: '2',
            tarifa: 12,
            baseImponible: 50,
            valor: 6,
          },
        ],
        valorTotal: 56,
      },
      motivos: [
        {
          razon: 'Intereses por mora',
          valor: 50,
        },
      ],
      ...overrides,
    });

    it('produces a well-formed <notaDebito> document with required nodes', async () => {
      const xml = service.buildNotaDebito(buildNotaDebitoFixture());
      const parsed = await parseXml(xml);

      expect(parsed.notaDebito).toBeDefined();
      expect(parsed.notaDebito.infoNotaDebito.valorTotal).toBe('56.00');
      expect(parsed.notaDebito.motivos.motivo.razon).toBe('Intereses por mora');
      expect(parsed.notaDebito.motivos.motivo.valor).toBe('50.00');
    });

    it('includes infoAdicional on notaDebito when provided', async () => {
      const xml = service.buildNotaDebito(
        buildNotaDebitoFixture({
          infoAdicional: [{ nombre: 'Nota', valor: 'Debito adicional' }],
        }),
      );
      const parsed = await parseXml(xml);
      expect(parsed.notaDebito.infoAdicional.campoAdicional.$.nombre).toBe('Nota');
      expect(parsed.notaDebito.infoAdicional.campoAdicional._).toBe('Debito adicional');
    });
  });

  describe('buildRetencion', () => {
    const impuestoFixture = (
      overrides: Partial<ImpuestoRetenido> = {},
    ): ImpuestoRetenido => ({
      codigo: '1',
      codigoRetencion: '303',
      baseImponible: 100,
      porcentajeRetener: 1,
      valorRetenido: 1,
      codDocSustento: '01',
      numDocSustento: '001-001-000000001',
      fechaEmisionDocSustento: '01/07/2026',
      totalSinImpuestos: 100,
      importeTotal: 112,
      impuestosDocSustento: [
        {
          codImpuestoDocSustento: '2',
          codigoPorcentaje: '2',
          baseImponible: 100,
          tarifa: 12,
          valorImpuesto: 12,
        },
      ],
      ...overrides,
    });

    const buildRetencionFixture = (
      infoOverrides: Partial<Retencion['infoCompRetencion']> = {},
      impuestos: ImpuestoRetenido[] = [impuestoFixture()],
      overrides: Partial<Retencion> = {},
    ): Retencion => ({
      infoTributaria: baseInfoTributaria(TipoComprobante.COMPROBANTE_RETENCION),
      infoCompRetencion: {
        fechaEmision: '03/07/2026',
        obligadoContabilidad: 'SI',
        tipoIdentificacionSujetoRetenido: '05' as any,
        razonSocialSujetoRetenido: 'Proveedor Test',
        identificacionSujetoRetenido: '1234567890',
        periodoFiscal: '07/2026',
        ...infoOverrides,
      },
      impuestos,
      ...overrides,
    });

    it('produces a well-formed <comprobanteRetencion> document with required nodes', async () => {
      const xml = service.buildRetencion(buildRetencionFixture());
      const parsed = await parseXml(xml);

      expect(parsed.comprobanteRetencion.$.id).toBe('comprobante');
      expect(parsed.comprobanteRetencion.$.version).toBe(RETENCION_VERSION);
      expect(parsed.comprobanteRetencion.infoTributaria.codDoc).toBe(
        TipoComprobante.COMPROBANTE_RETENCION,
      );
    });

    it('defaults parteRel to NO when not provided', async () => {
      const xml = service.buildRetencion(buildRetencionFixture());
      const parsed = await parseXml(xml);

      expect(parsed.comprobanteRetencion.infoCompRetencion.parteRel).toBe(
        'NO',
      );
    });

    it('honors an explicit parteRel value', async () => {
      const xml = service.buildRetencion(
        buildRetencionFixture({ parteRel: 'SI' }),
      );
      const parsed = await parseXml(xml);

      expect(parsed.comprobanteRetencion.infoCompRetencion.parteRel).toBe(
        'SI',
      );
    });

    it('omits tipoSujetoRetenido for a local identification type', async () => {
      const xml = service.buildRetencion(buildRetencionFixture());
      const parsed = await parseXml(xml);

      expect(
        parsed.comprobanteRetencion.infoCompRetencion.tipoSujetoRetenido,
      ).toBeUndefined();
    });

    it('throws BadRequestException when tipoIdentificacion is 08 without tipoSujetoRetenido', () => {
      expect(() =>
        service.buildRetencion(
          buildRetencionFixture({
            tipoIdentificacionSujetoRetenido: '08' as any,
          }),
        ),
      ).toThrow(BadRequestException);
    });

    it('includes tipoSujetoRetenido when tipoIdentificacion is 08 and it is provided', async () => {
      const xml = service.buildRetencion(
        buildRetencionFixture({
          tipoIdentificacionSujetoRetenido: '08' as any,
          tipoSujetoRetenido: '02',
        }),
      );
      const parsed = await parseXml(xml);

      expect(
        parsed.comprobanteRetencion.infoCompRetencion.tipoSujetoRetenido,
      ).toBe('02');
    });

    it('groups impuestos sharing the same documento sustento into a single docSustento node', async () => {
      const xml = service.buildRetencion(
        buildRetencionFixture(undefined, [
          impuestoFixture({ codigo: '1', codigoRetencion: '303' }),
          impuestoFixture({ codigo: '2', codigoRetencion: '3' }),
        ]),
      );
      const parsed = await parseXml(xml);
      const docSustento =
        parsed.comprobanteRetencion.docsSustento.docSustento;

      expect(Array.isArray(docSustento)).toBe(false);
      expect(docSustento.retenciones.retencion).toHaveLength(2);
      // dashes stripped from numDocSustento (15-digit format)
      expect(docSustento.numDocSustento).toBe('001001000000001');
    });

    it('creates separate docSustento nodes for impuestos with different documentos sustento', async () => {
      const xml = service.buildRetencion(
        buildRetencionFixture(undefined, [
          impuestoFixture({ numDocSustento: '001-001-000000001' }),
          impuestoFixture({ numDocSustento: '001-001-000000002' }),
        ]),
      );
      const parsed = await parseXml(xml);
      const docSustento =
        parsed.comprobanteRetencion.docsSustento.docSustento;

      expect(Array.isArray(docSustento)).toBe(true);
      expect(docSustento).toHaveLength(2);
    });

    it('includes infoAdicional on comprobanteRetencion when provided', async () => {
      const xml = service.buildRetencion(
        buildRetencionFixture(undefined, [impuestoFixture()], {
          infoAdicional: [{ nombre: 'Email', valor: 'proveedor@test.com' }],
        }),
      );
      const parsed = await parseXml(xml);
      expect(parsed.comprobanteRetencion.infoAdicional.campoAdicional.$.nombre).toBe('Email');
      expect(parsed.comprobanteRetencion.infoAdicional.campoAdicional._).toBe('proveedor@test.com');
    });
  });

  describe('parseXml', () => {
    it('parses XML string into javascript object', async () => {
      const xml = '<root><item>Hello</item></root>';
      const result = await service.parseXml<{ root: { item: string } }>(xml);
      expect(result.root.item).toBe('Hello');
    });
  });
});

