import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { CreateMeterUseCase } from './create-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';

describe('CreateMeterUseCase', () => {
  let useCase: CreateMeterUseCase;

  const mockMeterRepository = {
    create: jest.fn(),
    findUnique: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
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

    mockMeterRepository.findUnique.mockResolvedValue(null);
    mockMeterRepository.create.mockResolvedValue(expectedMedidor);

    const result = await useCase.execute(dto);

    expect(result.serie).toBe(dto.serie);
    expect(result.estado).toBe('BODEGA');
  });

  it('should reject a serial found during the pre-check', async () => {
    const serie = 'SER-READ-50';
    mockMeterRepository.findUnique.mockResolvedValue({ serie });

    await expect(
      useCase.execute({ serie, modelo: 'Digital-2000', marca: 'Siemens' }),
    ).rejects.toMatchObject({
      constructor: ConflictException,
      status: 409,
      message: `Ya existe un medidor registrado con el número de serie "${serie}".`,
    });
    expect(mockMeterRepository.create).not.toHaveBeenCalled();
  });

  it('should translate a concurrent P2002 into a conflict', async () => {
    const serie = 'SER-READ-51';
    const prismaError = new Prisma.PrismaClientKnownRequestError('duplicate', {
      code: 'P2002',
      clientVersion: '7.6.0',
    });
    mockMeterRepository.findUnique.mockResolvedValue(null);
    mockMeterRepository.create.mockRejectedValue(prismaError);

    await expect(
      useCase.execute({ serie, modelo: 'Digital-2000', marca: 'Siemens' }),
    ).rejects.toMatchObject({
      constructor: ConflictException,
      status: 409,
      message: `Ya existe un medidor registrado con el número de serie "${serie}".`,
    });
  });

  it('should propagate and log non-P2002 creation failures', async () => {
    const error = new Error('database unavailable');
    mockMeterRepository.findUnique.mockResolvedValue(null);
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
