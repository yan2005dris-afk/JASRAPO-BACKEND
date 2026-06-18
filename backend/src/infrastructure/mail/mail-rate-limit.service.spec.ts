import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MailRateLimitService } from './mail-rate-limit.service';
import { PrismaService } from '../database/prisma.service';

describe('MailRateLimitService', () => {
  let service: MailRateLimitService;

  const mockPrisma = {
    $queryRawUnsafe: jest.fn(),
    $executeRawUnsafe: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailRateLimitService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(MailRateLimitService);
    jest.clearAllMocks();
  });

  it('should acquire a slot when count is below the daily limit', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ sent_count: 1 }]);

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(true);
    expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalled();
  });

  it('should deny a slot when the daily limit is reached', async () => {
    mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(false);
  });

  it('should release a reserved slot after a failed send', async () => {
    mockPrisma.$executeRawUnsafe.mockResolvedValue(1);

    await service.release('brevo');

    expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalled();
  });

  it('should reset counter on day change (simulated by database behavior)', async () => {
    // The query uses CURRENT_DATE in the ON CONFLICT clause, so a new day means a new row is inserted.
    // We simulate the DB returning a new row with sent_count = 1.
    mockPrisma.$queryRawUnsafe.mockResolvedValue([{ sent_count: 1 }]);

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(true);
    expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining('CURRENT_DATE'),
      expect.any(Array),
    );
  });

  it('should strictly enforce quota logic without exceeding it', async () => {
    // Simulated DB response when WHERE sent_count < $2 prevents update
    mockPrisma.$queryRawUnsafe.mockResolvedValue([]);

    const acquired = await service.tryAcquire('brevo', 300);

    expect(acquired).toBe(false);
  });
});
