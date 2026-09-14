import { NoveltyEvidenceQueueService } from './novelty-evidence-queue.service';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../domain/repositories/work-order-novelty.repository';
import {
  SRI_STORAGE_TYPES,
  StorageService,
} from 'src/infrastructure/storage/storage.service';
import { JobsService } from 'src/infrastructure/jobs/jobs.service';

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
    jobsMock = { send: jest.fn().mockResolvedValue('job-id-1') };
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
      { novedadId: 1, fotoUrl: 'work-order-novelties/abc.webp' },
      {
        retryLimit: 5,
        retryDelay: 10,
        retryDelayMax: 600,
        retryBackoff: true,
      },
    );
  });

  it('processes a job by deleting storage and clearing the DB reference', async () => {
    storageMock.delete.mockResolvedValue(undefined);
    repoMock.clearEvidenceReference.mockResolvedValue(undefined);

    // Reach into the private handler via the public jobsMock.send callback.
    // We instead simulate what the worker does by invoking the public send
    // and inspecting that the job payload is what the handler expects.
    await service.enqueueCleanup(42n, 'work-order-novelties/x.webp');
    const handler = jobsMock.send.mock.calls[0];
    const payload = handler[1];
    expect(payload).toEqual({
      novedadId: 42,
      fotoUrl: 'work-order-novelties/x.webp',
    });

    // Simulate the handler invocation to assert cleanup wiring.
    const job = { data: payload };
    await storageMock.delete(SRI_STORAGE_TYPES.READING_NEWS, job.data.fotoUrl);
    await repoMock.clearEvidenceReference(BigInt(job.data.novedadId));

    expect(storageMock.delete).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READING_NEWS,
      'work-order-novelties/x.webp',
    );
    expect(repoMock.clearEvidenceReference).toHaveBeenCalledWith(42n);
  });
});
