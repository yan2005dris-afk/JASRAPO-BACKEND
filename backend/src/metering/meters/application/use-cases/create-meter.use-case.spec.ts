import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateMeterUseCase } from './create-meter.use-case';
import { MeterRepository } from '../../domain/repositories/meter.repository';

describe('CreateMeterUseCase', () => {
  let useCase: CreateMeterUseCase;

  const mockMeterRepository = {
    create: jest.fn(),
  };

  beforeEach(async () => {
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
    const dto = {
      serie: 'MED-001',
      modelo: 'Digital-2000',
      marca: 'Siemens',
      lecturaInicial: 0,
    };

    const expectedMedidor = {
      medidorId: BigInt(1),
      serie: dto.serie,
      modelo: dto.modelo,
      marca: dto.marca,
      estado: 'BODEGA',
    };

    mockMeterRepository.create.mockResolvedValue(expectedMedidor as any);

    const result = await useCase.execute(dto);

    expect(result.serie).toBe(dto.serie);
    expect(result.estado).toBe('BODEGA');
  });
});
