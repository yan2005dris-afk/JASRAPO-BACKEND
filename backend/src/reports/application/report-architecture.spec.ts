import * as fs from 'node:fs';
import * as path from 'node:path';
import { ClientServiceClientsListReportQueryAdapter } from '../infrastructure/queries/client-service-clients-list-report-query.adapter';
import { ClientsListReportDefinition } from './definitions/clients-list-report.definition';
import { ClientsListReportEmailStrategy } from './use-cases/send-report-by-email.strategies';
import { createClientsListPdfDocumentType } from '../pdf/factories/clients-list.factory';
import { ReportRequestContextFactory } from './report-request-context.factory';

const REPORTS_ROOT = path.resolve(__dirname, '..');
const TEMPLATES_ROOT = path.resolve(
  REPORTS_ROOT,
  '../infrastructure/pdf/templates',
);
const contextFactory = new ReportRequestContextFactory();
const actor = {
  sub: 7,
  usersId: 7,
  sid: 'session-7',
  permisos: [{ recurso: 'reportes', accion: 'read' }],
};

function readTypeScriptFiles(directory: string): string {
  return fs
    .readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) return readTypeScriptFiles(target);
      if (!entry.name.endsWith('.ts') || entry.name.endsWith('.spec.ts')) {
        return [];
      }
      return [fs.readFileSync(target, 'utf8')];
    })
    .join('\n');
}

describe('PDF-03 report architecture', () => {
  it('reportQueryPortReturnsTypedReadModel', async () => {
    const clientService = {
      findAll: jest.fn().mockResolvedValue({
        data: [
          {
            identificacion: '0912345678',
            nombres: 'Ana',
            apellidos: 'Pérez',
            razonSocial: null,
            email: 'ana@example.com',
            telefono: null,
            direccionDomicilio: null,
            activo: true,
            tipoIdentificacion: { descripcion: 'CÉDULA' },
          },
        ],
      }),
    };
    const port = new ClientServiceClientsListReportQueryAdapter(
      clientService as never,
    );

    const context = contextFactory.create({
      reportType: 'clients-list',
      actor,
      filters: { activo: true },
    });
    const readModel = await port.query(context);

    expect(readModel.clients[0]).toEqual(
      expect.objectContaining({
        identificacion: '0912345678',
        activo: true,
      }),
    );
    expect(readModel.generatedAt).toBeInstanceOf(Date);
  });

  it('reportProjectorIsSharedAcrossFormats', async () => {
    const queryPort = {
      query: jest.fn().mockResolvedValue({
        clients: [],
        filters: {},
        generatedAt: new Date('2024-05-20T00:00:00.000Z'),
      }),
    };
    const institutionalProfiles = {
      resolve: jest.fn().mockResolvedValue({
        institucion: { version: 'test-v1' },
        metadatosDocumento: {
          perfilInstitucional: { version: 'test-v1' },
        },
      }),
    };
    const definition = new ClientsListReportDefinition(
      queryPort,
      institutionalProfiles as never,
    );
    const context = contextFactory.create({
      reportType: 'clients-list',
      actor,
      filters: {},
    });
    const jsonProjection = await definition.generate(context);
    const pdfProjection = createClientsListPdfDocumentType('legacy').adaptData(
      jsonProjection.document,
    );
    const emailProjection = await new ClientsListReportEmailStrategy(definition)
      .build()
      .fetchReport(context);

    expect(pdfProjection).toEqual(jsonProjection.document);
    expect(emailProjection.document).toEqual(jsonProjection.document);
    expect(queryPort.query).toHaveBeenCalledTimes(2);
  });

  it('reportApplicationLayerDoesNotExposePrismaTypes', () => {
    const applicationSource = readTypeScriptFiles(
      path.join(REPORTS_ROOT, 'application'),
    );

    expect(applicationSource).not.toMatch(
      /PrismaService|generated\/prisma|@prisma\/client/,
    );
  });

  it('pdfAdapterContainsNoBusinessCalculations', () => {
    const reportPdfSource = readTypeScriptFiles(path.join(REPORTS_ROOT, 'pdf'));

    expect(reportPdfSource).not.toMatch(
      /\.reduce\(|Math\.(?:min|max)|\.toFixed\(|subtotalNumber|saldoAcumulado/,
    );
  });

  it('duplicateReportArtifactsHaveNoReferencesBeforeDeletion', () => {
    const removedTemplates = [
      'clients-list.hbs',
      'account-statement.hbs',
      'payment-agreement-legacy.hbs',
      'payment-agreement-modern.hbs',
    ];
    for (const template of removedTemplates) {
      expect(fs.existsSync(path.join(TEMPLATES_ROOT, template))).toBe(false);
    }

    const source = readTypeScriptFiles(REPORTS_ROOT);
    expect(source).not.toMatch(
      /createPaymentAgreementPdfDocumentType|PaymentsReportLegacyPdfDocumentType|PaymentsReportModernPdfDocumentType/,
    );
    expect(source).not.toMatch(
      /template:\s*['"](?:clients-list|account-statement)['"]/,
    );
    expect(
      fs.existsSync(path.join(TEMPLATES_ROOT, 'payment-agreement.liquid')),
    ).toBe(true);
  });
});
