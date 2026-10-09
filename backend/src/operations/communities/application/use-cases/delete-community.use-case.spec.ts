import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeleteCommunityUseCase } from './delete-community.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { communityRow } from '../../__test-utils__/community-row.factory';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('DeleteCommunityUseCase', () => {
  let useCase: DeleteCommunityUseCase;

  const mockCommunityRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteCommunityUseCase,
        { provide: CommunityRepository, useValue: mockCommunityRepository },
      ],
    }).compile();

    useCase = module.get<DeleteCommunityUseCase>(DeleteCommunityUseCase);
    jest.clearAllMocks();
  });

  it('should soft delete a community when found', async () => {
    const id = 1;
    const existing = communityRow({
      comunidadId: id,
      nombre: 'Comunidad 1',
      codigo: 'C1',
    });
    const deleted = communityRow({
      comunidadId: id,
      nombre: 'Comunidad 1',
      codigo: 'C1',
      deletedAt: new Date(),
    });

    mockCommunityRepository.findById.mockResolvedValue(existing);
    mockCommunityRepository.softDelete.mockResolvedValue(deleted);

    const result = await useCase.execute(id);

    expect(result).toEqual(deleted);
    expect(mockCommunityRepository.findById).toHaveBeenCalledWith(id);
    expect(mockCommunityRepository.softDelete).toHaveBeenCalledWith(id);
  });

  it('should throw EntityNotFoundException when community not found', async () => {
    mockCommunityRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(EntityNotFoundException);
  });
});
