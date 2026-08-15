import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateMeterUseCase } from './update-meter.use-case';
import { FindOneMeterUseCase } from './find-one-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('UpdateMeterUseCase', () => {
  let useCase: UpdateMeterUseCase;
  let findOneUseCase: FindOneMeterUseCase;

  const mockMedidorFromDb = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: 'BODEGA',
    deletedAt: null,
  };

  const mockMeterRepository = {
    update: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMeterUseCase,
        { provide: FindOneMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<UpdateMeterUseCase>(UpdateMeterUseCase);
    findOneUseCase = module.get<FindOneMeterUseCase>(FindOneMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should parse dates and update the meter', async () => {
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockMedidorFromDb);
    mockMeterRepository.update.mockResolvedValue(mockMedidorFromDb);

    const dto = {
      estado: 'INSTALADO',
      fechaInstalacion: '2024-01-15',
      fechaBaja: '2025-12-31',
    } as any;

    const result = await useCase.execute(BigInt(1), dto);

    expect(result).toBe(mockMedidorFromDb);
    expect(findOneUseCase.execute).toHaveBeenCalledWith(BigInt(1));
    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      {
        estado: 'INSTALADO',
        fechaInstalacion: new Date(2024, 0, 15),
        fechaBaja: new Date(2025, 11, 31),
      },
    );
  });

  it('should propagate EntityNotFoundException when meter does not exist', async () => {
    const domainError = new EntityNotFoundException('Medidor', BigInt(1));
    jest.spyOn(findOneUseCase, 'execute').mockRejectedValue(domainError);

    await expect(
      useCase.execute(BigInt(1), { estado: 'INSTALADO' } as any),
    ).rejects.toThrow(EntityNotFoundException);
    expect(mockMeterRepository.update).not.toHaveBeenCalled();
  });

  it('should throw on invalid date format', async () => {
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockMedidorFromDb);

    await expect(
      useCase.execute(BigInt(1), { fechaInstalacion: 'invalid-date' } as any),
    ).rejects.toThrow('Fecha inválida: invalid-date');
    expect(mockMeterRepository.update).not.toHaveBeenCalled();
  });
});
