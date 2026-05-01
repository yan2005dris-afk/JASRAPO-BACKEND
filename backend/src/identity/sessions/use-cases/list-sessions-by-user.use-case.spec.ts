import { Test, TestingModule } from '@nestjs/testing';
import { ListSessionsByUserUseCase } from './list-sessions-by-user.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('ListSessionsByUserUseCase', () => {
  let useCase: ListSessionsByUserUseCase;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListSessionsByUserUseCase,
        {
          provide: PrismaService,
          useValue: {
            sessions: {
              findMany: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    useCase = module.get<ListSessionsByUserUseCase>(ListSessionsByUserUseCase);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should list active sessions for user', async () => {
    (prisma.sessions.findMany as jest.Mock).mockResolvedValue([]);

    await useCase.execute(1);

    expect(prisma.sessions.findMany).toHaveBeenCalledWith({
      where: {
        usersId: 1,
        isRevoked: false,
        expiresAt: { gt: expect.any(Date) },
      },
      orderBy: { createdAt: 'desc' },
    });
  });
});
