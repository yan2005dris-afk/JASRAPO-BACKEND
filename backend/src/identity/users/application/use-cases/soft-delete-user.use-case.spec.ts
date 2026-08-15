import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { SoftDeleteUserUseCase } from './soft-delete-user.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('SoftDeleteUserUseCase', () => {
  let useCase: SoftDeleteUserUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SoftDeleteUserUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<SoftDeleteUserUseCase>(SoftDeleteUserUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should soft-delete the user by setting deletedAt', async () => {
    const deletedUser = { usuarioId: 1, deletedAt: new Date() };
    mockUserRepository.update.mockResolvedValue(deletedUser);

    const result = await useCase.execute(1);

    expect(mockUserRepository.update).toHaveBeenCalledWith(1, {
      deletedAt: expect.any(Date),
    });
    expect(result).toBe(deletedUser);
  });

  it('should propagate EntityNotFoundException when the user does not exist', async () => {
    mockUserRepository.update.mockRejectedValue(
      new EntityNotFoundException('Usuario', 999),
    );

    await expect(useCase.execute(999)).rejects.toThrow(EntityNotFoundException);
  });
});
