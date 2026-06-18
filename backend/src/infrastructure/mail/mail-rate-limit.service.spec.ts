import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MailRateLimitService } from './mail-rate-limit.service';
import { RawPgService } from '../database/raw-pg/raw-pg.service';

describe('MailRateLimitService', () => {
  let service: MailRateLimitService;

  const mockRawPg = {
    queryOne: jest.fn(),
    query: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailRateLimitService,
        { provide: RawPgService, useValue: mockRawPg },
      ],
    }).compile();

    service = module.get(MailRateLimitService);
    jest.clearAllMocks();
  });

  it('should acquire a slot when count is below the daily limit', async () => {
    mockRawPg.queryOne.mockResolvedValue({ sent_count: 1 });

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(true);
    expect(mockRawPg.queryOne).toHaveBeenCalled();
  });

  it('should deny a slot when the daily limit is reached', async () => {
    mockRawPg.queryOne.mockResolvedValue(null);

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(false);
  });

  it('should release a reserved slot after a failed send', async () => {
    mockRawPg.query.mockResolvedValue({ rows: [{ sent_count: 0 }] });

    await service.release('brevo');

    expect(mockRawPg.query).toHaveBeenCalled();
  });

  it('should reset counter on day change (simulated by database behavior)', async () => {
    // The query uses CURRENT_DATE in the ON CONFLICT clause, so a new day means a new row is inserted.
    // We simulate the DB returning a new row with sent_count = 1.
    mockRawPg.queryOne.mockResolvedValue({ sent_count: 1 });

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(true);
    expect(mockRawPg.queryOne).toHaveBeenCalledWith(
      expect.stringContaining('CURRENT_DATE'),
      expect.any(Array),
    );
  });

  it('should strictly enforce quota logic without exceeding it', async () => {
    // Simulated DB response when WHERE sent_count < $2 prevents update
    mockRawPg.queryOne.mockResolvedValue(null);

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(false);
  });
});
