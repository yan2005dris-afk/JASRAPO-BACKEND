import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeleteRouteUseCase } from './delete-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { NotFoundException } from '@nestjs/common';

describe('DeleteRouteUseCase', () => {
  let useCase: DeleteRouteUseCase;

  const mockRouteRepository = {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    paginateRutas: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUsuario: jest.fn(),
    findComunidad: jest.fn(),
    findSector: jest.fn(),
    paginateLecturas: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRouteUseCase,
        {
          provide: RouteRepository,
          useValue: mockRouteRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteRouteUseCase>(DeleteRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if route not found', async () => {
    mockRouteRepository.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toThrow(NotFoundException);
  });

  it('should soft delete route', async () => {
    mockRouteRepository.findUnique.mockResolvedValue({
      rutaId: 1n,
      deletedAt: null,
    });
    mockRouteRepository.update.mockResolvedValue({ rutaId: 1n });

    const result = await useCase.execute(1n);

    expect(mockRouteRepository.update).toHaveBeenCalledWith(
      { rutaId: 1n },
      { deletedAt: expect.any(Date) },
    );
    expect(result.message).toBe('Ruta eliminada correctamente');
  });
});
