import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateSectorUseCase } from './update-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { NotFoundException } from '@nestjs/common';

describe('UpdateSectorUseCase', () => {
  let useCase: UpdateSectorUseCase;

  const mockSectorRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findComunidad: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<UpdateSectorUseCase>(UpdateSectorUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should update a sector successfully', async () => {
    const dto = { nombre: 'Sector Updated' };
    const mockExistingSector = {
      sectorId: 1,
      nombre: 'Old',
      comunidadId: 1,
      deletedAt: null,
    };
    const mockUpdatedSector = {
      sectorId: 1,
      nombre: 'Sector Updated',
      comunidadId: 1,
    };
    mockSectorRepository.findUnique.mockResolvedValue(mockExistingSector);
    mockSectorRepository.update.mockResolvedValue(mockUpdatedSector);

    const result = await useCase.execute(1, dto);

    expect(result).toEqual(mockUpdatedSector);
    expect(mockSectorRepository.update).toHaveBeenCalledWith(
      { sectorId: 1 },
      dto,
    );
  });
});
