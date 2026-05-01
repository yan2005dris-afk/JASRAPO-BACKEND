import { Test, TestingModule } from '@nestjs/testing';
import { RevokeSessionUseCase } from './revoke-session.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('RevokeSessionUseCase', () => {
  let useCase: RevokeSessionUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeSessionUseCase,
        {
          provide: PrismaService,
          useValue: {
            sessions: {
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<RevokeSessionUseCase>(RevokeSessionUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should revoke a session', async () => {
    await useCase.execute('abc');

    expect(prisma.sessions.update).toHaveBeenCalledWith({
      where: { sessionsId: 'abc' },
      data: { isRevoked: true },
    });
  });
});
