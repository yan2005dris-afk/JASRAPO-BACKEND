import { NoveltyEvidenceQueueService } from './novelty-evidence-queue.service';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';

describe('NoveltyEvidenceQueueService', () => {
  let service: NoveltyEvidenceQueueService;
  let repoMock: any;
  let storageMock: any;
  let jobsMock: any;

  beforeEach(() => {
    repoMock = {
      clearEvidenceReference: jest.fn(),
    };
    storageMock = { delete: jest.fn() };
    jobsMock = {
      send: jest.fn().mockResolvedValue('job-id-1'),
      work: jest.fn().mockResolvedValue('worker-id-1'),
    };
    service = new NoveltyEvidenceQueueService(repoMock, storageMock, jobsMock);
  });

  it('skips enqueue when fotoUrl is null', async () => {
    await service.enqueueCleanup(1n, null);
    expect(jobsMock.send).not.toHaveBeenCalled();
  });

  it('enqueues a pg-boss job with retry/backoff options', async () => {
    await service.enqueueCleanup(1n, 'work-order-novelties/abc.webp');
    expect(jobsMock.send).toHaveBeenCalledWith(
      'cleanup-novedad-evidence',
      { novedadId: '1', fotoUrl: 'work-order-novelties/abc.webp' },
      {
        retryLimit: 5,
        retryDelay: 10,
        retryDelayMax: 600,
        retryBackoff: true,
      },
    );
  });

  it('processes the registered worker callback in storage-then-DB order', async () => {
    const events: string[] = [];
    storageMock.delete.mockImplementation(async () => events.push('storage'));
    repoMock.clearEvidenceReference.mockImplementation(async () =>
      events.push('database'),
    );

    await service.onApplicationBootstrap();
    const worker = jobsMock.work.mock.calls[0][1];
    await service.enqueueCleanup(42n, 'work-order-novelties/x.webp');
    const payload = jobsMock.send.mock.calls[0][1];
    await worker([{ data: payload }]);

    expect(payload).toEqual({
      novedadId: '42',
      fotoUrl: 'work-order-novelties/x.webp',
    });
    expect(storageMock.delete).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READING_NEWS,
      'work-order-novelties/x.webp',
    );
    expect(repoMock.clearEvidenceReference).toHaveBeenCalledWith(
      42n,
      'work-order-novelties/x.webp',
    );
    expect(events).toEqual(['storage', 'database']);
  });
});
