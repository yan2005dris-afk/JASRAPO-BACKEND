import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RemoveMeterUseCase } from './remove-meter.use-case';
import { FindOneMeterUseCase } from './find-one-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

describe('RemoveMeterUseCase', () => {
  let useCase: RemoveMeterUseCase;
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
        RemoveMeterUseCase,
        { provide: FindOneMeterUseCase, useValue: { execute: jest.fn() } },
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<RemoveMeterUseCase>(RemoveMeterUseCase);
    findOneUseCase = module.get<FindOneMeterUseCase>(FindOneMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should soft delete the meter and return a confirmation message', async () => {
    jest.spyOn(findOneUseCase, 'execute').mockResolvedValue(mockMedidorFromDb);
    mockMeterRepository.update.mockResolvedValue(mockMedidorFromDb);

    const result = await useCase.execute(BigInt(1));

    expect(result).toEqual({ message: 'Medidor con ID 1 eliminado' });
    expect(findOneUseCase.execute).toHaveBeenCalledWith(BigInt(1));
    expect(mockMeterRepository.update).toHaveBeenCalledWith(
      { medidorId: BigInt(1) },
      { deletedAt: expect.any(Date) },
    );
  });

  it('should propagate EntityNotFoundException when meter does not exist', async () => {
    const domainError = new EntityNotFoundException('Medidor', BigInt(99));
    jest.spyOn(findOneUseCase, 'execute').mockRejectedValue(domainError);

    await expect(useCase.execute(BigInt(99))).rejects.toThrow(
      EntityNotFoundException,
    );
    expect(mockMeterRepository.update).not.toHaveBeenCalled();
  });
});