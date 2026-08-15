import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { FindOneCommunityUseCase } from './find-one-community.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('FindOneCommunityUseCase', () => {
  let useCase: FindOneCommunityUseCase;

  const mockCommunityRepository = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneCommunityUseCase,
        { provide: CommunityRepository, useValue: mockCommunityRepository },
      ],
    }).compile();

    useCase = module.get<FindOneCommunityUseCase>(FindOneCommunityUseCase);
    jest.clearAllMocks();
  });

  it('should return community entity when found', async () => {
    const entity = new CommunityEntity({
      comunidadId: 1,
      nombre: 'Comunidad 1',
      codigo: 'C1',
      porcentajeTasaSeguridad: 5,
    });
    mockCommunityRepository.findById.mockResolvedValue(entity);

    const result = await useCase.execute(1);
    expect(result).toEqual(entity);
    expect(mockCommunityRepository.findById).toHaveBeenCalledWith(1);
  });

  it('should throw EntityNotFoundException when community not found', async () => {
    mockCommunityRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(99)).rejects.toThrow(EntityNotFoundException);
  });
});
