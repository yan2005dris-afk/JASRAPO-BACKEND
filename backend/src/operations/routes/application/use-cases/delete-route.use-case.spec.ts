import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeleteRouteUseCase } from './delete-route.use-case';
import { RouteRepository } from '../../domain/repositories/route.repository';
import { routeRow } from '../../__test-utils__/route-row.factory';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('DeleteRouteUseCase', () => {
  let useCase: DeleteRouteUseCase;

  const mockRouteRepository = {
    findById: jest.fn(),
    softDelete: jest.fn(),
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
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw EntityNotFoundException if route not found', async () => {
    mockRouteRepository.findById.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toThrow(EntityNotFoundException);
  });

  it('should soft delete route', async () => {
    const existing = routeRow({
      rutaId: 1n,
      nombre: 'Route 1',
      operarioId: 1,
      comunidadId: 1,
      periodoId: 1,
      estado: 'PENDIENTE',
      fechaInicio: null,
      fechaFin: null,
      tipoActividad: { codigo: 'LECTURA' },
    });
    mockRouteRepository.findById.mockResolvedValue(existing);
    mockRouteRepository.softDelete.mockResolvedValue(existing);

    const result = await useCase.execute(1n);

    expect(mockRouteRepository.findById).toHaveBeenCalledWith(1n);
    expect(mockRouteRepository.softDelete).toHaveBeenCalledWith(1n);
    expect(result.rutaId).toBe(1n);
  });
});
