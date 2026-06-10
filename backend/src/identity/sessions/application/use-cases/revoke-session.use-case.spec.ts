import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RevokeSessionUseCase } from './revoke-session.use-case';
import { SessionRepository } from '../../domain/repositories/session.repository';

describe('RevokeSessionUseCase', () => {
  let useCase: RevokeSessionUseCase;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevokeSessionUseCase,
        {
          provide: SessionRepository,
          useValue: {
            revoke: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<RevokeSessionUseCase>(RevokeSessionUseCase);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  it('should revoke a session', async () => {
    await useCase.execute('abc');

    expect(sessionRepository.revoke).toHaveBeenCalledWith('abc');
  });
});
