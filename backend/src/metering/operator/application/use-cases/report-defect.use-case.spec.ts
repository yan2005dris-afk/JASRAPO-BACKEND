import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ReportDefectUseCase } from './report-defect.use-case';
import { MeterRepository } from '../../../meters/domain/repositories/meter.repository';
import { EstadoMedidor } from 'src/shared/enums';

describe('ReportDefectUseCase', () => {
  let useCase: ReportDefectUseCase;

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
      estado: EstadoMedidor.INSTALADO,
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
        ReportDefectUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<ReportDefectUseCase>(ReportDefectUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException when meter does not exist', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should throw BadRequestException when meter is not in INSTALADO state', async () => {
    mockMeterRepository.findUnique.mockResolvedValue(
      makeMeter({ estado: EstadoMedidor.PENDIENTE }),
    );

    await expect(useCase.execute(BigInt(1))).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should update meter to DANADO and return the updated entity', async () => {
    const damagedMeter = makeMeter({ estado: EstadoMedidor.DANADO });

    mockMeterRepository.findUnique.mockResolvedValue(makeMeter());
    mockMeterRepository.update.mockResolvedValue(damagedMeter);

    const result = await useCase.execute(BigInt(1));

    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      { estado: EstadoMedidor.DANADO },
    );
    expect(result.estado).toBe(EstadoMedidor.DANADO);
  });
});
