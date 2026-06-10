import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetSessionUseCase } from './get-session.use-case';
import { SessionRepository } from '../../domain/repositories/session.repository';

describe('GetSessionUseCase', () => {
  let useCase: GetSessionUseCase;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSessionUseCase,
        {
          provide: SessionRepository,
          useValue: {
            findActiveSession: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<GetSessionUseCase>(GetSessionUseCase);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  it('should find an active session', async () => {
    (sessionRepository.findActiveSession as jest.Mock).mockResolvedValue({
      sesionId: 'abc',
    });

    await useCase.execute(1, 'abc');

    expect(sessionRepository.findActiveSession).toHaveBeenCalledWith(1, 'abc');
  });
});
