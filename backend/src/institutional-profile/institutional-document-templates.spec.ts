import * as fs from 'node:fs';
import * as path from 'node:path';
import { Liquid } from 'liquidjs';
import type { InstitutionalDocumentContext } from './domain/institutional-profile.types';

const templatesRoot = path.resolve(
  __dirname,
  '../infrastructure/pdf/templates',
);

const liquidEngine = new Liquid({
  root: [templatesRoot, path.join(templatesRoot, 'partials')],
  extname: '.liquid',
  dynamicPartials: true,
  strictFilters: false,
  strictVariables: false,
});

liquidEngine.registerFilter('isEven', (a: unknown) => Number(a) % 2 === 0);
liquidEngine.registerFilter('isOdd', (a: unknown) => Number(a) % 2 !== 0);

function renderTemplate(templateName: string, data: object): string {
  const source = fs.readFileSync(
    path.join(templatesRoot, `${templateName}.liquid`),
    'utf8',
  );
  return liquidEngine.renderSync(liquidEngine.parse(source), data);
}

function institutionalContext(
  legalIntroduction = 'Texto legal configurable de prueba',
): InstitutionalDocumentContext {
  return {
    institucion: {
      perfilInstitucionalId: '88',
      version: 'test-v88',
      vigenteDesde: new Date('2026-01-01T00:00:00.000Z'),
      vigenteHasta: null,
      nombreLegal: 'Institución Configurable de Prueba',
      nombreComercial: 'MARCA CONFIGURABLE',
      siglas: 'ICP',
      ruc: '9999999999999',
      decretoNumero: 'D-TEST',
      decretoFecha: null,
      decretoFechaTexto: null,
      registroOficialNumero: 'R-TEST',
      registroOficialFecha: null,
      registroOficialFechaTexto: null,
      fechaFundacion: null,
      fechaFundacionTexto: null,
      direccion: 'Dirección configurable',
      ubicacion: {
        localidad: 'Localidad configurable',
        parroquia: 'Parroquia configurable',
        canton: 'Cantón configurable',
        provincia: 'Provincia configurable',
        pais: 'País configurable',
      },
      correo: 'configurable@example.com',
      telefonos: [{ etiqueta: 'Oficina', numero: '555-0100' }],
      representantes: [
        {
          nombres: 'Representante Configurable',
          identificacion: '0000000000',
          cargo: 'Cargo Configurable',
          esPrincipal: true,
        },
      ],
      representantePrincipal: {
        nombres: 'Representante Configurable',
        identificacion: '0000000000',
        cargo: 'Cargo Configurable',
        esPrincipal: true,
      },
      branding: {
        logo: {
          contenedor: 'assets',
          clave: 'logo-v88.png',
          tipoContenido: 'image/png',
          url: 'data:image/png;base64,dGVzdA==',
        },
        marcaAgua: {
          contenedor: 'assets',
          clave: 'watermark-v88.png',
          tipoContenido: 'image/png',
          url: 'data:image/png;base64,dGVzdA==',
        },
      },
      textosLegales: {
        convenioPago: {
          introduccionOficina: legalIntroduction,
          compromisoUsuario: 'Compromiso configurable',
          identificacionUsuario: 'Identificación configurable',
          cuotasMensuales: 'Cuotas configurables',
          inicioConvenio: 'Inicio configurable',
          cumplimiento: 'Cumplimiento configurable',
          pagoEfectivo: 'Pago configurable',
          pagosPosteriores: 'Pagos posteriores configurables',
          primeraCuota: 'Primera cuota configurable',
          cierre: 'Cierre configurable',
        },
        actaResponsabilidad: {
          introduccionOficina: legalIntroduction,
          compromisoUsuario: 'Compromiso configurable',
          clausulas: ['Cláusula configurable'],
          cierre: 'Cierre configurable',
        },
      },
    },
    metadatosDocumento: {
      perfilInstitucional: {
        perfilInstitucionalId: '88',
        version: 'test-v88',
        vigenteDesde: '2026-01-01T00:00:00.000Z',
        vigenteHasta: null,
      },
    },
  };
}

function renderPaymentAgreement(context: InstitutionalDocumentContext) {
  return renderTemplate('payment-agreement', {
    ...context,
    convenio: {
      fechaActual: '24 de agosto de 2026',
      numeroGuia: 'G-1',
      clienteNombre: 'Cliente',
      clienteCI: '0101010101',
      cuotaMensual: '10.00',
      primeraCuota: '10.00',
      deudaTotal: '100.00',
      periodoInicio: 'agosto de 2026',
      mesPrimerPago: 'septiembre de 2026',
    },
  });
}

describe('Institutional document templates', () => {
  it('templateRendersOnlyProvidedInstitutionalValues', () => {
    const html = renderPaymentAgreement(institutionalContext());

    expect(html).toContain('Institución Configurable de Prueba');
    expect(html).toContain('9999999999999');
    expect(html).toContain('Representante Configurable');
    expect(html).toContain('Texto legal configurable de prueba');
    expect(html).not.toContain('2490016050001');
    expect(html).not.toContain('Humberto Salinas');
  });

  it('legalTextChangesDoNotRequireTemplateChanges', () => {
    const originalSource = fs.readFileSync(
      path.join(templatesRoot, 'payment-agreement.liquid'),
      'utf8',
    );
    const first = renderPaymentAgreement(
      institutionalContext('Primera versión legal'),
    );
    const second = renderPaymentAgreement(
      institutionalContext('Segunda versión legal'),
    );

    expect(first).toContain('Primera versión legal');
    expect(second).toContain('Segunda versión legal');
    expect(
      fs.readFileSync(
        path.join(templatesRoot, 'payment-agreement.liquid'),
        'utf8',
      ),
    ).toBe(originalSource);
  });

  it('ninguna plantilla conserva valores institucionales heredados', () => {
    const sources = fs
      .readdirSync(templatesRoot)
      .filter((name) => name.endsWith('.liquid'))
      .map((name) => fs.readFileSync(path.join(templatesRoot, name), 'utf8'))
      .join('\n');

    expect(sources).not.toMatch(
      /2490016050001|0960005820001|Humberto Salinas|0915233670|juntaaguaolon2017/i,
    );
  });

  it('acta de responsabilidad renderiza branding institucional y textos legales dinámicos', () => {
    const context = institutionalContext();
    const html = renderTemplate('responsibility-agreement', {
      ...context,
      acta: {
        clienteNombre: 'JUAN PEREZ',
        identificacion: '0987654321',
        medidorSerie: 'MED-001',
        comunidad: 'Olón',
        sector: 'Centro',
        fechaEmision: '25 de agosto de 2026',
        numeroActa: 'ACT-001',
      },
    });

    expect(html).toContain('data:image/png;base64,dGVzdA');
    expect(html).toContain('Texto legal configurable de prueba');
    expect(html).toContain('Cláusula configurable');
    expect(html).toContain('JUAN PEREZ');
  });

  it('la migración impide vigencias superpuestas en la base de datos', () => {
    const migration = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../prisma/migrations/20260824010000_add_institutional_profile_versions/migration.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('EXCLUDE USING gist');
    expect(migration).toContain("'[)'");
  });

  it('la migración del perfil exige exactamente un emisor activo y es idempotente', () => {
    const migration = fs.readFileSync(
      path.resolve(
        __dirname,
        '../../prisma/migrations/20260824011000_seed_initial_institutional_profile/migration.sql',
      ),
      'utf8',
    );

    expect(migration).toContain('active_emisor_count');
    expect(migration).toContain('se requiere exactamente un emisor activo');
    expect(migration).toContain('RAISE EXCEPTION');
    expect(migration).toContain('active_emisor_id');
    expect(migration).toContain('ON CONFLICT ("version") DO NOTHING');
    expect(migration).not.toMatch(/ORDER BY\s+id\s+ASC/i);
    expect(migration).not.toMatch(/LIMIT\s+1/i);
  });
});
