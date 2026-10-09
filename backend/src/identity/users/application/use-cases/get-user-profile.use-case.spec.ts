import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetUserProfileUseCase } from './get-user-profile.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { userRow } from '../../__test-utils__/user-row.factory';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('GetUserProfileUseCase', () => {
  let useCase: GetUserProfileUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetUserProfileUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetUserProfileUseCase>(GetUserProfileUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should return the user when found', async () => {
    const user = userRow({
      usuarioId: 1,
      email: 'user@example.com',
      nombres: 'Juan',
      apellidos: 'Perez',
      deletedAt: null,
    });
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute(1);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
    expect(result).toBe(user);
  });

  it('should throw EntityNotFoundException when the user does not exist', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });

  it('should throw EntityNotFoundException when the user is soft-deleted', async () => {
    mockUserRepository.findById.mockResolvedValue({
      usuarioId: 1,
      deletedAt: new Date(),
    } as any);

    await expect(useCase.execute(1)).rejects.toThrow(EntityNotFoundException);
  });
});
