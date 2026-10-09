import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { LinkLecturaUseCase } from './link-lectura.use-case';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import type { OrdenTrabajoRow } from '../../infrastructure/repositories/route.include';
import { ordenTrabajoRow } from '../../__test-utils__/route-row.factory';

describe('LinkLecturaUseCase', () => {
  let useCase: LinkLecturaUseCase;

  const mockOrdenTrabajoRepository = {
    linkLectura: jest.fn(),
    verifyOperatorWorkOrderOwnership: jest.fn(),
  };

  const sampleOrden: OrdenTrabajoRow = ordenTrabajoRow({
    ordenTrabajoId: 1n,
    rutaId: 10n,
    contratoId: 100n,
    medidorId: 200n,
    ordenVisita: 1,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
  });

  const sampleOrdenAfterLink: OrdenTrabajoRow = {
    ...sampleOrden,
    lecturaId: 999n,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkLecturaUseCase,
        {
          provide: OrdenTrabajoRepository,
          useValue: mockOrdenTrabajoRepository,
        },
      ],
    }).compile();

    useCase = module.get<LinkLecturaUseCase>(LinkLecturaUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should verify ownership, delegate to repository.linkLectura, and return the result', async () => {
    mockOrdenTrabajoRepository.linkLectura.mockResolvedValue(
      sampleOrdenAfterLink,
    );

    const result = await useCase.execute(1n, { lecturaId: 999n }, 42);

    expect(
      mockOrdenTrabajoRepository.verifyOperatorWorkOrderOwnership,
    ).toHaveBeenCalledWith(42, 1n);
    expect(mockOrdenTrabajoRepository.linkLectura).toHaveBeenCalledWith(1n, {
      lecturaId: 999n,
    });
    expect(result).toBe(sampleOrdenAfterLink);
    expect(result.lecturaId).toBe(999n);
  });

  it('should propagate repository errors (e.g., entity not found)', async () => {
    const repoError = new Error('Orden not found');
    mockOrdenTrabajoRepository.linkLectura.mockRejectedValue(repoError);

    await expect(useCase.execute(1n, { lecturaId: 999n }, 42)).rejects.toBe(
      repoError,
    );
  });
});
