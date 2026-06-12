import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeleteSectorUseCase } from './delete-sector.use-case';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { NotFoundException } from '@nestjs/common';

describe('DeleteSectorUseCase', () => {
  let useCase: DeleteSectorUseCase;

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
        DeleteSectorUseCase,
        { provide: SectorRepository, useValue: mockSectorRepository },
      ],
    }).compile();

    useCase = module.get<DeleteSectorUseCase>(DeleteSectorUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should delete a sector successfully', async () => {
    mockSectorRepository.findUnique.mockResolvedValue({
      sectorId: 1,
      deletedAt: null,
    });
    mockSectorRepository.delete.mockResolvedValue({ sectorId: 1 });

    const result = await useCase.execute(1);

    expect(result).toEqual({
      message: 'Sector eliminado exitosamente.',
      statusCode: 200,
    });
    expect(mockSectorRepository.findUnique).toHaveBeenCalledWith({
      sectorId: 1,
    });
    expect(mockSectorRepository.delete).toHaveBeenCalledWith({
      sectorId: 1,
    });
  });

  it('should throw NotFoundException if sector does not exist', async () => {
    mockSectorRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(999)).rejects.toThrow(
      new NotFoundException('Sector con ID 999 no encontrado'),
    );
  });
});
