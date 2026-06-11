import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeleteCommunityUseCase } from './delete-community.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';

describe('DeleteCommunityUseCase', () => {
  let useCase: DeleteCommunityUseCase;

  const mockCommunityRepository = {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCommunityUseCase,
        { provide: CommunityRepository, useValue: mockCommunityRepository },
      ],
    }).compile();

    useCase = module.get<DeleteCommunityUseCase>(DeleteCommunityUseCase);
  });

  it('should delete a community', async () => {
    const id = 1;
    mockCommunityRepository.findUnique.mockResolvedValue({
      comunidadId: id,
      deletedAt: null,
    });
    mockCommunityRepository.update.mockResolvedValue({
      comunidadId: id,
      deletedAt: new Date(),
    });

    const result = await useCase.execute(id);

    expect(result).toBeDefined();
    expect(mockCommunityRepository.update).toHaveBeenCalled();
  });
});
