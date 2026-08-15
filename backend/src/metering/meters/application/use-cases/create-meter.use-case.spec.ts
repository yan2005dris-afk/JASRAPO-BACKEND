import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateMeterUseCase } from './create-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';
const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('CreateMeterUseCase', () => {
  let useCase: CreateMeterUseCase;

  const mockMeterRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: LoggerService, useValue: mockLogger },
        CreateMeterUseCase,
        { provide: MeterRepository, useValue: mockMeterRepository },
      ],
    }).compile();

    useCase = module.get<CreateMeterUseCase>(CreateMeterUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create device with BODEGA status', async () => {
    const dto = {
      serie: 'MED-001',
      modelo: 'Digital-2000',
      marca: 'Siemens',
    };

    const expectedMedidor = {
      medidorId: BigInt(1),
      serie: dto.serie,
      modelo: dto.modelo,
      marca: dto.marca,
      estado: 'BODEGA',
    };

    mockMeterRepository.create.mockResolvedValue(expectedMedidor);

    const result = await useCase.execute(dto);

    expect(result.serie).toBe(dto.serie);
    expect(result.estado).toBe('BODEGA');
  });

  it('should propagate EntityAlreadyExistsException when serial already exists', async () => {
    const serie = 'SER-READ-51';
    const domainError = new EntityAlreadyExistsException(
      'Medidor',
      'serie',
      serie,
    );
    mockMeterRepository.create.mockRejectedValue(domainError);

    await expect(
      useCase.execute({ serie, modelo: 'Digital-2000', marca: 'Siemens' }),
    ).rejects.toThrow(EntityAlreadyExistsException);
  });

  it('should propagate and log creation failures', async () => {
    const error = new Error('database unavailable');
    mockMeterRepository.create.mockRejectedValue(error);

    await expect(
      useCase.execute({
        serie: 'SER-READ-52',
        modelo: 'Digital-2000',
        marca: 'Siemens',
      }),
    ).rejects.toBe(error);
  });
});
