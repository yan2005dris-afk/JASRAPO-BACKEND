import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateSessionUseCase } from './update-session.use-case';
import { SessionRepository } from '../../domain/repositories/session.repository';

describe('UpdateSessionUseCase', () => {
  let useCase: UpdateSessionUseCase;
  let sessionRepository: SessionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSessionUseCase,
        {
          provide: SessionRepository,
          useValue: {
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    useCase = module.get<UpdateSessionUseCase>(UpdateSessionUseCase);
    sessionRepository = module.get<SessionRepository>(SessionRepository);
  });

  it('should update a session', async () => {
    const data = { direccionIp: '1.1.1.1' } as any;
    await useCase.execute('abc', data);

    expect(sessionRepository.update).toHaveBeenCalledWith('abc', data);
  });
});
