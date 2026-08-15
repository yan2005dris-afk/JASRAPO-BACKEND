import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetActiveUsersUseCase } from './get-active-users.use-case';
import { UserRepository } from '../../domain/repositories/user.repository';

describe('GetActiveUsersUseCase', () => {
  let useCase: GetActiveUsersUseCase;
  let userRepository: UserRepository;

  const mockUserRepository = {
    findManyActive: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetActiveUsersUseCase,
        { provide: UserRepository, useValue: mockUserRepository },
      ],
    }).compile();

    useCase = module.get<GetActiveUsersUseCase>(GetActiveUsersUseCase);
    userRepository = module.get<UserRepository>(UserRepository);
  });

  it('should delegate pagination to findManyActive and return the result', async () => {
    const pagination = { page: 2, limit: 5 };
    const result = {
      data: [{ usuarioId: 1 }],
      meta: { total: 1, page: 2, limit: 5 },
    };
    mockUserRepository.findManyActive.mockResolvedValue(result);

    const output = await useCase.execute(pagination);

    expect(mockUserRepository.findManyActive).toHaveBeenCalledWith(pagination);
    expect(output).toBe(result);
  });

  it('should return an empty paginated result when there are no active users', async () => {
    const pagination = { page: 1, limit: 10 };
    const empty = { data: [], meta: { total: 0, page: 1, limit: 10 } };
    mockUserRepository.findManyActive.mockResolvedValue(empty);

    const output = await useCase.execute(pagination);

    expect(output).toEqual(empty);
  });
});
