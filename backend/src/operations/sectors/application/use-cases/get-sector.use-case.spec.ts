import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetSectorUseCase } from './get-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { NotFoundException } from '@nestjs/common';

describe('GetSectorUseCase', () => {
  let useCase: GetSectorUseCase;

  const mockSectorRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findComunidad: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<GetSectorUseCase>(GetSectorUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a sector if it exists', async () => {
    const mockSector = {
      sectorId: 1,
      nombre: 'Sector 1',
      comunidadId: 1,
      deletedAt: null,
    };
    mockSectorRepository.findUnique.mockResolvedValue(mockSector);

    const result = await useCase.execute(1);

    expect(result).toEqual(mockSector);
    expect(mockSectorRepository.findUnique).toHaveBeenCalledWith(
      { sectorId: 1 },
      expect.any(Object),
    );
  });

  it('should throw NotFoundException if sector does not exist', async () => {
    mockSectorRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      new NotFoundException('Sector con ID 999 no encontrado'),
    );
  });
});
