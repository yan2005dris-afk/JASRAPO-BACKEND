import { JobService } from './job-service.interface';

describe('JobService', () => {
  it('can be extended and the send method returns the expected result', async () => {
    class TestJobService extends JobService {
      async send(name: string, data: object): Promise<string> {
        return `sent-${name}`;
      }
    }

    const service = new TestJobService();
    const result = await service.send('test.job', { key: 'value' });
    expect(result).toBe('sent-test.job');
  });

  it('enforces the send method contract (different implementation)', async () => {
    class AlwaysFailsJobService extends JobService {
      async send(_name: string, _data: object): Promise<string> {
        throw new Error('queue-down');
      }
    }

    const service = new AlwaysFailsJobService();
    await expect(service.send('fail.job', {})).rejects.toThrow('queue-down');
  });
});
