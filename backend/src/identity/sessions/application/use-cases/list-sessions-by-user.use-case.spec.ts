import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ListSessionsByUserUseCase } from './list-sessions-by-user.use-case';
import { SessionRepository } from '../../domain/repositories/session.repository';

describe('ListSessionsByUserUseCase', () => {
  let useCase: ListSessionsByUserUseCase;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListSessionsByUserUseCase,
        {
          provide: SessionRepository,
          useValue: {
            findActiveSessionsByUser: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<ListSessionsByUserUseCase>(ListSessionsByUserUseCase);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  it('should list active sessions for user', async () => {
    (sessionRepository.findActiveSessionsByUser as jest.Mock).mockResolvedValue(
      [],
    );

    await useCase.execute(1);

    expect(sessionRepository.findActiveSessionsByUser).toHaveBeenCalledWith(1);
  });
});
