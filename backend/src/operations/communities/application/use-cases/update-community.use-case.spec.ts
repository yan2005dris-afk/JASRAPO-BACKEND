import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateCommunityUseCase } from './update-community.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateCommunityUseCase', () => {
  let useCase: UpdateCommunityUseCase;

  const mockCommunityRepository = {
    findById: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateCommunityUseCase,
        { provide: CommunityRepository, useValue: mockCommunityRepository },
      ],
    }).compile();

    useCase = module.get<UpdateCommunityUseCase>(UpdateCommunityUseCase);
    jest.clearAllMocks();
  });

  it('should update a community when found', async () => {
    const id = 1;
    const dto = { nombre: 'Comunidad Updated' };
    const existing = new CommunityEntity({
      comunidadId: id,
      nombre: 'Old Name',
      codigo: 'C1',
      deletedAt: null,
    });
    const updated = new CommunityEntity({
      comunidadId: id,
      nombre: 'Comunidad Updated',
      codigo: 'C1',
      deletedAt: null,
    });

    mockCommunityRepository.findById.mockResolvedValue(existing);
    mockCommunityRepository.update.mockResolvedValue(updated);

    const result = await useCase.execute(id, dto);

    expect(result).toEqual(updated);
    expect(mockCommunityRepository.findById).toHaveBeenCalledWith(id);
    expect(mockCommunityRepository.update).toHaveBeenCalledWith(id, dto);
  });

  it('should throw EntityNotFoundException when community not found', async () => {
    mockCommunityRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99, { nombre: 'Test' })).rejects.toThrow(
      EntityNotFoundException,
    );
  });
});
