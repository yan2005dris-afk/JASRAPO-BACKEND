import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateMeterUseCase } from './create-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
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
    // lecturaInicial is intentionally NOT a creation field: a meter enters the
    // system in BODEGA state without a reading. The initial reading is captured
    // at INSTALL time via InstallMeterDto and stored on historialMedidores
    // (see InstallMeterDto + MeterRepository.createHistory). CreateMeterDto
    // correctly rejects it via forbidNonWhitelisted in main.ts.
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

  it('should translate a concurrent P2002 into a conflict', async () => {
    const serie = 'SER-READ-51';
    const prismaError = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '7.6.0',
    });
    mockMeterRepository.create.mockRejectedValue(prismaError);
    const loggerWarn = jest
      .spyOn(
        (useCase as unknown as { logger: { warn: unknown } }).logger,
        'warn',
      )
      .mockImplementation();

    await expect(
      useCase.execute({ serie, modelo: 'Digital-2000', marca: 'Siemens' }),
    ).rejects.toMatchObject({
      constructor: ConflictException,
      status: 409,
      message: `Ya existe un medidor registrado con el número de serie "${serie}".`,
    });
    expect(loggerWarn).toHaveBeenCalledTimes(1);
    expect(loggerWarn).toHaveBeenCalledWith(
      `Duplicate meter creation attempt for serial ${serie}`,
    );
  });

  it('should propagate and log non-P2002 creation failures', async () => {
    const error = new Error('database unavailable');
    mockMeterRepository.create.mockRejectedValue(error);
    const loggerError = jest
      .spyOn(
        (useCase as unknown as { logger: { error: unknown } }).logger,
        'error',
      )
      .mockImplementation();

    await expect(
      useCase.execute({
        serie: 'SER-READ-52',
        modelo: 'Digital-2000',
        marca: 'Siemens',
      }),
    ).rejects.toBe(error);
    expect(loggerError).toHaveBeenCalledWith(
      'Failed to create meter with serial SER-READ-52',
      error.stack,
      CreateMeterUseCase.name,
    );
  });
});
