import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { DecommissionMeterUseCase } from './decommission-meter.use-case';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor } from 'src/shared/enums';
import { OperatorRepository } from '../../domain/repositories/operator.repository';

describe('DecommissionMeterUseCase', () => {
  let useCase: DecommissionMeterUseCase;

  const mockMeterRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
    verifyMeterOwnership: jest.fn(),
  };

  function makeMeter(overrides: Record<string, unknown> = {}) {
    return {
      medidorId: BigInt(1),
      marca: 'Marca',
      modelo: 'Modelo',
      serie: 'MED-001',
      estado: EstadoMedidor.DANADO,
      fechaInstalacion: new Date(),
      fechaBaja: null,
      motivo: null,
      latitud: null,
      longitud: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      ...overrides,
    };
  }

  beforeEach(async () => {
    jest.clearAllMocks();
    mockMeterRepository.verifyMeterOwnership.mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecommissionMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
        { provide: OperatorRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<DecommissionMeterUseCase>(DecommissionMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw EntityNotFoundException when meter does not exist', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999), 'Motivo')).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw EntityNotFoundException when meter is soft-deleted', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ deletedAt: new Date() }),
    );

    await expect(useCase.execute(BigInt(1), 'Motivo')).rejects.toThrow(
      EntityNotFoundException,
    );
  });

  it('should throw InvalidDomainOperationException when meter is not in DANADO state', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ estado: EstadoMedidor.INSTALADO }),
    );

    await expect(useCase.execute(BigInt(1), 'Motivo')).rejects.toThrow(
      InvalidDomainOperationException,
    );
  });

  it('should update meter to BAJA and return the updated entity', async () => {
    const decommissionedMeter = makeMeter({
      estado: EstadoMedidor.BAJA,
      fechaBaja: new Date(),
      motivo: 'Motivo',
    });

    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.update.mockResolvedValue(decommissionedMeter);

    const result = await useCase.execute(BigInt(1), 'Motivo');

    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      expect.objectContaining({
        estado: EstadoMedidor.BAJA,
        fechaBaja: expect.any(Date),
        motivo: 'Motivo',
      }),
    );
    expect(result.estado).toBe(EstadoMedidor.BAJA);
    expect(result.fechaBaja).toBeInstanceOf(Date);
  });

  it('should reject a meter not owned by the operator', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.verifyMeterOwnership.mockRejectedValue(
      new InvalidDomainOperationException(
        'El medidor no pertenece a tu ruta asignada',
      ),
    );

    await expect(useCase.execute(BigInt(1), 'Motivo', 7)).rejects.toThrow(
      InvalidDomainOperationException,
    );
    expect(mockMeterRepository.update).not.toHaveBeenCalled();
  });
});
