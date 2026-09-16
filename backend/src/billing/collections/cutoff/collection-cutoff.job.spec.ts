import { CollectionCutoffJob } from './collection-cutoff.job';
import {
  COLLECTION_CUTOFF_CRON,
  COLLECTION_CUTOFF_JOB,
} from './collection-cutoff.job';

describe('CollectionCutoffJob', () => {
  it('registers a daily singleton job and evaluates only on the configured day', async () => {
    const jobs = { schedule: jest.fn(), work: jest.fn() };
    const service = {
      getConfig: jest.fn().mockResolvedValue({
        diaCorteMensual: 15,
        mesesParaMora: 3,
        mesesParaCorte: 5,
      }),
      isConfiguredEvaluationDay: jest.fn().mockReturnValue(false),
      evaluateAndUpdateStatus: jest.fn(),
    };
    jobs.work.mockImplementation(async (_name, handler) => handler([]));

    await new CollectionCutoffJob(
      jobs as never,
      service as never,
    ).onModuleInit();
    expect(jobs.schedule).toHaveBeenCalledWith(
      COLLECTION_CUTOFF_JOB,
      COLLECTION_CUTOFF_CRON,
      {},
      { singletonKey: COLLECTION_CUTOFF_JOB },
    );
    expect(service.evaluateAndUpdateStatus).not.toHaveBeenCalled();
  });
});
