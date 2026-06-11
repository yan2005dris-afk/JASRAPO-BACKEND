import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateCommunityUseCase } from './update-community.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';

describe('UpdateCommunityUseCase', () => {
  let useCase: UpdateCommunityUseCase;

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
        UpdateCommunityUseCase,
        { provide: CommunityRepository, useValue: mockCommunityRepository },
      ],
    }).compile();

    useCase = module.get<UpdateCommunityUseCase>(UpdateCommunityUseCase);
  });

  it('should update a community', async () => {
    const id = 1;
    const dto = { nombre: 'Comunidad Updated' };
    mockCommunityRepository.findUnique.mockResolvedValue({
      comunidadId: id,
      nombre: 'Old Name',
      deletedAt: null,
    });
    mockCommunityRepository.update.mockResolvedValue({
      comunidadId: id,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await useCase.execute(id, dto);

    expect(result).toBeDefined();
    expect(mockCommunityRepository.update).toHaveBeenCalled();
  });
});
