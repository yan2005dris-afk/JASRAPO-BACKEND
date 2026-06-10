import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateSessionUseCase } from './create-session.use-case';
import { SessionRepository } from '../../domain/repositories/session.repository';

describe('CreateSessionUseCase', () => {
  let useCase: CreateSessionUseCase;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateSessionUseCase,
        {
          provide: SessionRepository,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<CreateSessionUseCase>(CreateSessionUseCase);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  it('should create a session', async () => {
    const data = {
      usuarioId: 1,
      hashRefreshToken: 'hash',
      expiraEn: new Date(),
    } as any;
    (sessionRepository.create as jest.Mock).mockResolvedValue({
      id: 1,
      ...data,
    });

    await useCase.execute(data);

    expect(sessionRepository.create).toHaveBeenCalledWith(data);
  });
});
