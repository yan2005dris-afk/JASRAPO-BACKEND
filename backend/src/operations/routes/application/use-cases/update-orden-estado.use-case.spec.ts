import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateOrdenEstadoUseCase } from './update-orden-estado.use-case';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateOrdenEstadoUseCase', () => {
  let useCase: UpdateOrdenEstadoUseCase;

  const mockOrdenTrabajoRepository = {
    updateEstado: jest.fn(),
    verifyOperatorWorkOrderOwnership: jest.fn(),
  };

  const sampleOrden = new OrdenTrabajoEntity({
    ordenTrabajoId: 1n,
    rutaId: 10n,
    contratoId: 100n,
    medidorId: 200n,
    tipoActividad: 'INSTALACION',
    estado: 'PENDIENTE',
    ordenVisita: 1,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
    completadoEn: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    lecturaId: null,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateOrdenEstadoUseCase,
        {
          provide: OrdenTrabajoRepository,
          useValue: mockOrdenTrabajoRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateOrdenEstadoUseCase>(UpdateOrdenEstadoUseCase);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it.each(['PENDIENTE', 'EN_PROGRESO', 'COMPLETADA', 'CANCELADA', 'FALLIDA'])(
    'should accept valid estado %s, verify ownership, and delegate to repository',
    async (estado) => {
      const updated = new OrdenTrabajoEntity({
        ...sampleOrden,
        estado,
      });
      mockOrdenTrabajoRepository.updateEstado.mockResolvedValue(updated);

      const result = await useCase.execute(
        1n,
        {
          estado,
          resultadoObservacion: 'ok',
        },
        42,
      );

      expect(
        mockOrdenTrabajoRepository.verifyOperatorWorkOrderOwnership,
      ).toHaveBeenCalledWith(42, 1n);
      expect(mockOrdenTrabajoRepository.updateEstado).toHaveBeenCalledWith(1n, {
        estado,
        resultadoObservacion: 'ok',
      });
      expect(result.estado).toBe(estado);
    },
  );

  it('should throw InvalidDomainOperationException for invalid estado', async () => {
    await expect(
      useCase.execute(
        1n,
        {
          estado: 'BOGUS_STATE',
        },
        42,
      ),
    ).rejects.toThrow(InvalidDomainOperationException);

    expect(
      mockOrdenTrabajoRepository.verifyOperatorWorkOrderOwnership,
    ).not.toHaveBeenCalled();
    expect(mockOrdenTrabajoRepository.updateEstado).not.toHaveBeenCalled();
  });

  it('should propagate repository errors after validating estado', async () => {
    const dbError = new Error('connection lost');
    mockOrdenTrabajoRepository.updateEstado.mockRejectedValue(dbError);

    await expect(
      useCase.execute(1n, { estado: 'COMPLETADA' }, 42),
    ).rejects.toBe(dbError);
  });
});
