import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DecommissionMeterUseCase } from './decommission-meter.use-case';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor } from 'src/shared/enums';

describe('DecommissionMeterUseCase', () => {
  let useCase: DecommissionMeterUseCase;

  const mockMeterRepository = {
    findUnique: jest.fn(),
    update: jest.fn(),
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DecommissionMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<DecommissionMeterUseCase>(DecommissionMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when meter does not exist', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException when meter is not in DANADO state', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ estado: EstadoMedidor.INSTALADO }),
    );

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(BadRequestException);
  });

  it('should update meter to BAJA and return the updated entity', async () => {
    const decommissionedMeter = makeMeter({
      estado: EstadoMedidor.BAJA,
      fechaBaja: new Date(),
    });

    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.update.mockResolvedValue(decommissionedMeter);

    const result = await useCase.execute(BigInt(1));

    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      expect.objectContaining({
        estado: EstadoMedidor.BAJA,
        fechaBaja: expect.any(Date),
      }),
    );
    expect(result.estado).toBe(EstadoMedidor.BAJA);
    expect(result.fechaBaja).toBeInstanceOf(Date);
  });
});
