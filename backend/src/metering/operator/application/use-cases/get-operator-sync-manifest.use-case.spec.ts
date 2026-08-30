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
});
