import {
  ConflictDomainException,
  DomainValidationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { GetOperatorSyncManifestUseCase } from './get-operator-sync-manifest.use-case';

const page = (hasMore = false) => ({
  items: [],
  total: hasMore ? 2 : 0,
  hasMore,
  nextPosition: hasMore
    ? { updatedAt: new Date('2026-01-01T00:00:00Z'), id: 1n }
    : null,
});

describe('GetOperatorSyncManifestUseCase', () => {
  const repository = {
    findActivePeriod: jest.fn(),
    findActiveRoutes: jest.fn(),
    findSyncRoutes: jest.fn(),
    findSyncWorkOrders: jest.fn(),
    findSyncMeters: jest.fn(),
    findSyncReadings: jest.fn(),
    findSyncPendingAnomalies: jest.fn(),
    findSyncChanges: jest.fn(),
    getSyncWatermark: jest.fn(),
    getSyncSnapshotContext: jest.fn(),
  };
  let useCase: GetOperatorSyncManifestUseCase;
  beforeEach(() => {
    jest.clearAllMocks();
    repository.findActivePeriod.mockResolvedValue({ periodoId: 7 });
    repository.findActiveRoutes.mockResolvedValue([
      { rutaId: 3n, comunidadId: 1, sectorId: null },
    ]);
    repository.findSyncRoutes.mockResolvedValue(page());
    repository.findSyncWorkOrders.mockResolvedValue(page());
    repository.findSyncMeters.mockResolvedValue(page());
    repository.findSyncReadings.mockResolvedValue(page());
    repository.findSyncPendingAnomalies.mockResolvedValue(page());
    repository.getSyncWatermark.mockResolvedValue(12n);
    repository.getSyncSnapshotContext.mockResolvedValue({
      snapshotVersion: new Date('2026-01-01T00:00:00Z'),
      watermark: 12n,
    });
    repository.findSyncChanges.mockResolvedValue({
      items: [],
      hasMore: false,
      nextSequence: null,
    });
    useCase = new GetOperatorSyncManifestUseCase(
      repository as any,
      {
        get: jest.fn().mockReturnValue('test-cursor-secret'),
      } as any,
    );
  });

  it('returns the first bounded page and complete semantics', async () => {
    const result = await useCase.execute(10, undefined, 2);
    expect(result.complete).toBe(true);
    expect(result.mode).toBe('snapshot');
    expect(result.snapshotVersion).toBeTruthy();
    expect(repository.findSyncReadings).toHaveBeenCalledWith(
      7,
      expect.any(Array),
      expect.any(Date),
      null,
      2,
    );
    expect(result.routes.nextCursor).toBeNull();
  });

  it('uses the business name for meters in the offline snapshot', async () => {
    repository.findSyncMeters.mockResolvedValue({
      items: [
        {
          medidorId: 55n,
          serie: 'MED-55',
          marca: 'Marca',
          modelo: 'Modelo',
          estado: 'INSTALADO',
          fechaInstalacion: null,
          fechaBaja: null,
          motivo: null,
          historial: [
            {
              contrato: {
                contratoId: 99n,
                direccionSuministro: 'Calle 1',
                cliente: {
                  nombres: 'Nombre',
                  apellidos: 'Personal',
                  razonSocial: 'Empresa del Agua',
                },
              },
            },
          ],
        },
      ],
      total: 1,
      hasMore: false,
      nextPosition: null,
    });

    const result = await useCase.execute(10);

    expect(result.meters.items[0]).toMatchObject({
      serie: 'MED-55',
      clienteNombre: 'Empresa del Agua',
    });
  });

  it('serializes readings and work orders without BigInt leakage in snapshot mode', async () => {
    repository.findSyncReadings.mockResolvedValue({
      items: [
        {
          lecturaId: 101n,
          fecha: new Date('2026-01-01T00:00:00Z'),
          lecturaAnterior: 10,
          lecturaActual: 15,
          consumoCalculado: 5,
          descripcionAnomalia: null,
          fechaValidacion: null,
          evidenciaFotoUrl: null,
          lecturaInicial: false,
          periodoId: 7,
          estado: 'LEIDA',
          updatedAt: new Date('2026-01-01T00:00:00Z'),
          medidor: {
            medidorId: 55n,
            serie: 'MED-55',
            marca: 'Marca',
            modelo: 'Mod',
            historial: [
              {
                contrato: {
                  contratoId: 99n,
                  numeroGuia: 'G-1',
                  direccionSuministro: 'Dir',
                  estado: 'ACTIVO',
                  comunidadId: 1,
                  sectorId: null,
                  cliente: { nombres: 'Ana', apellidos: 'Gómez' },
                },
              },
            ],
          },
          periodoRel: null,
        },
      ],
      total: 1,
      hasMore: false,
      nextPosition: null,
    });

    const result = await useCase.execute(10);
    // JSON.stringify will throw if any BigInt remained un-serialized
    expect(() => JSON.stringify(result)).not.toThrow();
    expect((result.readings.items[0] as any).lecturaId).toBe('101');
    expect((result.readings.items[0] as any).contratoId).toBe('99');
    expect((result.readings.items[0] as any).medidor.medidorId).toBe('55');
  });

  it('transitions to incremental mode after initial collections complete', async () => {
    const initial = await useCase.execute(10, undefined, 2);
    const incremental = await useCase.execute(10, initial.nextCursor!, 2);

    expect(initial.mode).toBe('snapshot');
    expect(incremental.mode).toBe('incremental');
    expect(repository.findSyncChanges).toHaveBeenCalledWith(
      7,
      expect.any(Array),
      12n,
      2,
    );
    expect(repository.findSyncRoutes).toHaveBeenCalledTimes(1);
    expect(repository.findSyncWorkOrders).toHaveBeenCalledTimes(1);
    expect(repository.findSyncMeters).toHaveBeenCalledTimes(1);
    expect(repository.findSyncReadings).toHaveBeenCalledTimes(1);
    expect(repository.findSyncPendingAnomalies).toHaveBeenCalledTimes(1);
  });

  it('maps incremental CREATE, UPDATE, and DELETE changes without BigInt leakage', async () => {
    const initial = await useCase.execute(10);
    repository.findSyncChanges.mockResolvedValue({
      items: [
        {
          sequenceId: 13n,
          entityType: 'rutas',
          entityId: 3n,
          operation: 'CREATE',
          changedAt: new Date('2026-01-02T00:00:00Z'),
          data: { rutaId: '3', nested: { ids: [3n] } },
        },
        {
          sequenceId: 14n,
          entityType: 'medidores',
          entityId: 8n,
          operation: 'UPDATE',
          changedAt: new Date('2026-01-02T00:01:00Z'),
          data: { serie: 'M-8' },
        },
        {
          sequenceId: 15n,
          entityType: 'ordenes_trabajo',
          entityId: 9n,
          operation: 'DELETE',
          changedAt: new Date('2026-01-02T00:02:00Z'),
          data: {},
        },
      ],
      hasMore: false,
      nextSequence: null,
    });

    const result = await useCase.execute(10, initial.nextCursor);
    expect(result.mode).toBe('incremental');
    expect(result.changes).toEqual([
      expect.objectContaining({
        sequenceId: '13',
        entityId: '3',
        operation: 'CREATE',
      }),
      expect.objectContaining({
        sequenceId: '14',
        entityId: '8',
        operation: 'UPDATE',
      }),
      expect.objectContaining({
        sequenceId: '15',
        entityId: '9',
        operation: 'DELETE',
        data: {},
      }),
    ]);
    expect(() => JSON.stringify(result)).not.toThrow();
  });

  it('delivers a tombstone when an assigned route leaves active scope', async () => {
    const initial = await useCase.execute(10);
    repository.findActiveRoutes.mockResolvedValue([]);
    repository.findSyncChanges.mockResolvedValue({
      items: [
        {
          sequenceId: 13n,
          entityType: 'rutas',
          entityId: 3n,
          operation: 'DELETE',
          changedAt: new Date('2026-01-02T00:00:00Z'),
          data: { rutaId: '3' },
        },
      ],
      hasMore: false,
      nextSequence: null,
    });

    const result = await useCase.execute(10, initial.nextCursor);

    expect(result.changes).toEqual([
      expect.objectContaining({ operation: 'DELETE', entityId: '3' }),
    ]);
    expect(repository.findSyncChanges).toHaveBeenLastCalledWith(
      7,
      [{ rutaId: 3n, comunidadId: 1, sectorId: null }],
      12n,
      100,
    );
  });

  it('continues the incremental cursor watermark from the last sequence', async () => {
    const initial = await useCase.execute(10);
    repository.findSyncChanges
      .mockResolvedValueOnce({
        items: [
          {
            sequenceId: 13n,
            entityType: 'rutas',
            entityId: 3n,
            operation: 'UPDATE',
            changedAt: new Date(),
            data: {},
          },
          {
            sequenceId: 14n,
            entityType: 'rutas',
            entityId: 4n,
            operation: 'UPDATE',
            changedAt: new Date(),
            data: {},
          },
        ],
        hasMore: true,
        nextSequence: 14n,
      })
      .mockResolvedValueOnce({ items: [], hasMore: false, nextSequence: null });

    const next = await useCase.execute(10, initial.nextCursor, 2);
    await useCase.execute(10, next.nextCursor, 2);
    expect(repository.findSyncChanges.mock.calls.at(-1)).toEqual([
      7,
      expect.any(Array),
      14n,
      2,
    ]);
  });

  it('continues independently from an opaque cursor', async () => {
    repository.findSyncRoutes.mockResolvedValue(page(true));
    const first = await useCase.execute(10, undefined, 2);
    const cursor = first.routes.nextCursor;
    expect(cursor).toEqual(expect.any(String));
    await useCase.execute(10, cursor!, 2);
    expect(repository.findSyncRoutes.mock.calls[1][3]).toEqual({
      updatedAt: new Date('2026-01-01T00:00:00Z'),
      id: 1n,
    });
  });

  it.each(['not-a-cursor', Buffer.from('{}').toString('base64url')])(
    'rejects malformed cursor %s',
    async (cursor) => {
      await expect(useCase.execute(10, cursor)).rejects.toBeInstanceOf(
        DomainValidationException,
      );
    },
  );

  it('rejects a tampered signed cursor', async () => {
    repository.findSyncRoutes.mockResolvedValue(page(true));
    const cursor = (await useCase.execute(10)).routes.nextCursor!;
    await expect(useCase.execute(10, `${cursor}x`)).rejects.toBeInstanceOf(
      DomainValidationException,
    );
  });

  it('fails closed for the wrong operator and changed route scope', async () => {
    repository.findSyncRoutes.mockResolvedValue(page(true));
    const cursor = (await useCase.execute(10)).routes.nextCursor!;
    await expect(useCase.execute(11, cursor)).rejects.toBeInstanceOf(
      ConflictDomainException,
    );
    repository.findActiveRoutes.mockResolvedValue([
      { rutaId: 4n, comunidadId: 1, sectorId: null },
    ]);
    await expect(useCase.execute(10, cursor)).rejects.toBeInstanceOf(
      ConflictDomainException,
    );
  });

  it('does not expose coordinates on manifest meter entries (moved to contracts)', async () => {
    repository.findSyncMeters.mockResolvedValue({
      items: [
        {
          medidorId: 55n,
          codigo: 'MED-000055',
          marca: 'Itron',
          modelo: 'CX1000',
          serie: 'MED-55',
          estado: 'INSTALADO',
          fechaInstalacion: new Date('2026-01-01T00:00:00Z'),
          fechaBaja: null,
          motivo: null,
          createdAt: new Date('2026-01-01T00:00:00Z'),
          updatedAt: new Date('2026-01-01T00:00:00Z'),
          deletedAt: null,
          historial: [],
        },
      ],
      total: 1,
      hasMore: false,
      nextPosition: null,
    });

    const result = await useCase.execute(10);
    expect(result.meters.items[0]).not.toHaveProperty('latitud');
    expect(result.meters.items[0]).not.toHaveProperty('longitud');
  });
});
