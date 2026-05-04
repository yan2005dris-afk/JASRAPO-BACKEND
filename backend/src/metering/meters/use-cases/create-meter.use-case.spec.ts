import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateMeterUseCase } from './create-meter.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreateMeterUseCase', () => {
  let useCase: CreateMeterUseCase;

  const mockPrismaService = {
    medidores: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMeterUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
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

    // FK pattern: estadoId + estado relation
    const expectedMedidor = {
      medidorId: BigInt(1),
      serie: dto.serie,
      modelo: dto.modelo,
      marca: dto.marca,
      estadoId: BigInt(1),
      estado: { codigo: 'BODEGA', nombre: 'En Bodega' },
    };

    mockPrismaService.medidores.create.mockResolvedValue(
      expectedMedidor as any,
    );

    const result = await useCase.execute(dto);

    expect(result.serie).toBe(dto.serie);
    expect(result.estado).toBe('BODEGA');
  });
});
