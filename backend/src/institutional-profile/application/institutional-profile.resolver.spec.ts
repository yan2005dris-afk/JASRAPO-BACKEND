import { ConflictException, NotFoundException } from '@nestjs/common';
import type {
  InstitutionalAssetPort,
  InstitutionalProfileQueryPort,
} from './ports/institutional-profile.ports';
import { InstitutionalProfileResolver } from './institutional-profile.resolver';
import type {
  InstitutionalAssetReference,
  InstitutionalProfile,
} from '../domain/institutional-profile.types';

const assetReference: InstitutionalAssetReference = {
  contenedor: 'institutional-assets',
  clave: 'profiles/test/logo.png',
  tipoContenido: 'image/png',
};

function profile(
  version: string,
  vigenteDesde: string,
  vigenteHasta: string | null,
): InstitutionalProfile {
  return {
    perfilInstitucionalId: version === 'v1' ? 1n : 2n,
    version,
    vigenteDesde: new Date(vigenteDesde),
    vigenteHasta: vigenteHasta ? new Date(vigenteHasta) : null,
    nombreLegal: `Institución ${version}`,
    nombreComercial: `Marca ${version}`,
    siglas: 'TEST',
    ruc: '9999999999999',
    decretoNumero: '1',
    decretoFecha: new Date('2000-01-01T00:00:00.000Z'),
    registroOficialNumero: '2',
    registroOficialFecha: new Date('2000-01-02T00:00:00.000Z'),
    fechaFundacion: new Date('2000-01-03T00:00:00.000Z'),
    direccion: 'Dirección de prueba',
    ubicacion: {
      localidad: 'Localidad',
      parroquia: 'Parroquia',
      canton: 'Cantón',
      provincia: 'Provincia',
      pais: 'Ecuador',
    },
    correo: 'institucion@example.com',
    telefonos: [{ etiqueta: 'Oficina', numero: '123' }],
    representantes: [
      {
        nombres: 'Representante de prueba',
        identificacion: '0000000000',
        cargo: 'Presidencia',
        esPrincipal: true,
      },
    ],
    logoReferencia: assetReference,
    marcaAguaReferencia: {
      ...assetReference,
      clave: 'profiles/test/watermark.png',
    },
    textosLegales: {
      convenioPago: {
        introduccionOficina: 'Introducción',
        compromisoUsuario: 'Compromiso',
        identificacionUsuario: 'Usuario',
        cuotasMensuales: 'Cuotas',
        inicioConvenio: 'Inicio',
        cumplimiento: 'Cumplimiento',
        pagoEfectivo: 'Pago',
        pagosPosteriores: 'Posteriores',
        primeraCuota: 'Primera cuota',
        cierre: 'Cierre',
      },
      actaResponsabilidad: {
        introduccionOficina: 'Introducción',
        compromisoUsuario: 'Compromiso',
        clausulas: ['Cláusula'],
        cierre: 'Cierre',
      },
    },
  };
}

describe('InstitutionalProfileResolver', () => {
  const assets: InstitutionalAssetPort = {
    resolve: jest.fn(async (reference: InstitutionalAssetReference) => ({
      ...reference,
      url: `data:${reference.tipoContenido};base64,dGVzdA==`,
    })),
  };

  beforeEach(() => jest.clearAllMocks());

  it('institutionalProfileResolvesVersionByValidityPeriod', async () => {
    const first = profile(
      'v1',
      '2025-01-01T00:00:00.000Z',
      '2026-01-01T00:00:00.000Z',
    );
    const second = profile('v2', '2026-01-01T00:00:00.000Z', null);
    const profiles: InstitutionalProfileQueryPort = {
      findValidAt: jest.fn(async (at: Date) =>
        [first, second].filter(
          (item) =>
            item.vigenteDesde <= at &&
            (!item.vigenteHasta || at < item.vigenteHasta),
        ),
      ),
    };
    const resolver = new InstitutionalProfileResolver(profiles, assets);

    const result = await resolver.resolve(new Date('2026-01-01T00:00:00.000Z'));

    expect(result.institucion.version).toBe('v2');
    expect(result.institucion.branding.logo.clave).toBe(
      'profiles/test/logo.png',
    );
  });

  it('documentRecordsInstitutionalProfileVersion', async () => {
    const profiles: InstitutionalProfileQueryPort = {
      findValidAt: jest
        .fn()
        .mockResolvedValue([profile('v2', '2026-01-01T00:00:00.000Z', null)]),
    };
    const resolver = new InstitutionalProfileResolver(profiles, assets);
    const context = await resolver.resolve(
      new Date('2026-08-24T12:00:00.000Z'),
    );

    const document = resolver.attach({ reporte: { total: 1 } }, context);

    expect(document.metadatosDocumento.perfilInstitucional).toEqual({
      perfilInstitucionalId: '2',
      version: 'v2',
      vigenteDesde: '2026-01-01T00:00:00.000Z',
      vigenteHasta: null,
    });
  });

  it('overlappingInstitutionalValidityIsRejected', async () => {
    const profiles: InstitutionalProfileQueryPort = {
      findValidAt: jest
        .fn()
        .mockResolvedValue([
          profile('v1', '2025-01-01T00:00:00.000Z', null),
          profile('v2', '2026-01-01T00:00:00.000Z', null),
        ]),
    };
    const resolver = new InstitutionalProfileResolver(profiles, assets);

    await expect(
      resolver.resolve(new Date('2026-08-24T12:00:00.000Z')),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('falla antes del render cuando no existe una versión vigente', async () => {
    const profiles: InstitutionalProfileQueryPort = {
      findValidAt: jest.fn().mockResolvedValue([]),
    };
    const resolver = new InstitutionalProfileResolver(profiles, assets);

    await expect(
      resolver.resolve(new Date('2026-08-24T12:00:00.000Z')),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(assets.resolve).not.toHaveBeenCalled();
  });

  it('usa cache en memoria y evita reconsultar BD y storage en llamadas subsecuentes', async () => {
    const validProfile = profile('v1', '2025-01-01T00:00:00.000Z', null);
    const findValidAt = jest.fn().mockResolvedValue([validProfile]);
    const profiles: InstitutionalProfileQueryPort = { findValidAt };
    const resolver = new InstitutionalProfileResolver(profiles, assets);

    const first = await resolver.resolve(new Date('2026-08-24T12:00:00.000Z'));
    const second = await resolver.resolve(new Date('2026-08-24T15:30:00.000Z'));

    expect(first.institucion.version).toBe('v1');
    expect(second.institucion.version).toBe('v1');
    expect(findValidAt).toHaveBeenCalledTimes(1);
  });

  it('deduplica resoluciones concurrentes para la misma fecha', async () => {
    const validProfile = profile('v1', '2025-01-01T00:00:00.000Z', null);
    const findValidAt = jest
      .fn()
      .mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve([validProfile]), 20),
          ),
      );
    const profiles: InstitutionalProfileQueryPort = { findValidAt };
    const resolver = new InstitutionalProfileResolver(profiles, assets);

    const [first, second] = await Promise.all([
      resolver.resolve(new Date('2026-08-24T12:00:00.000Z')),
      resolver.resolve(new Date('2026-08-24T12:00:00.000Z')),
    ]);

    expect(first.institucion.version).toBe('v1');
    expect(second.institucion.version).toBe('v1');
    expect(findValidAt).toHaveBeenCalledTimes(1);
  });
});
