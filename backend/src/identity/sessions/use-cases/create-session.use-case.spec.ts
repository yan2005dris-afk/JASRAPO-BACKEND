import { Test, TestingModule } from '@nestjs/testing';
import { CreateSessionUseCase } from './create-session.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSessionUseCase,
        {
          provide: PrismaService,
          useValue: {
            sessions: {
              create: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateSessionUseCase>(CreateSessionUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should create a session', async () => {
    const data = { usersId: 1, refreshTokenHash: 'hash', expiresAt: new Date() } as any;
    (prisma.sessions.create as jest.Mock).mockResolvedValue({ id: 1, ...data });

    await useCase.execute(data);

    expect(prisma.sessions.create).toHaveBeenCalledWith({ data });
  });
});
