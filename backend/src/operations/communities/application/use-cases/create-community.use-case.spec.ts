import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateCommunityUseCase } from './create-community.use-case';
import { CommunityRepository } from '../../domain/repositories/community.repository';

describe('CreateCommunityUseCase', () => {
  let useCase: CreateCommunityUseCase;

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
        CreateCommunityUseCase,
        { provide: CommunityRepository, useValue: mockCommunityRepository },
      ],
    }).compile();

    useCase = module.get<CreateCommunityUseCase>(CreateCommunityUseCase);

    // Default mocks to avoid crashes
    mockCommunityRepository.findFirst.mockResolvedValue(null);
    mockCommunityRepository.findUnique.mockResolvedValue(null);
  });

  it('should create a community', async () => {
    const dto = {
      nombre: 'Comunidad Test',
      codigo: 'CT-001',
      porcentajeTasaSeguridad: 5,
    };
    mockCommunityRepository.create.mockResolvedValue({
      comunidadId: 1,
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    });

    const result = await useCase.execute(dto);

    expect(result).toBeDefined();
    expect(mockCommunityRepository.create).toHaveBeenCalled();
  });
});
