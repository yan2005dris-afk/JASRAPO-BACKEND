import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateDeviceUseCase } from './create-device.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoMedidor } from 'src/generated/prisma/client';

describe('CreateDeviceUseCase', () => {
  let useCase: CreateDeviceUseCase;

  const mockPrismaService = {
    medidores: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateDeviceUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<CreateDeviceUseCase>(CreateDeviceUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create device with BODEGA status', async () => {
    const dto = {
      numeroSerie: 'MED-001',
      modelo: 'Digital-2000',
      marca: ' Siemens',
      lecturaInicial: 0,
      serie: 'SERIAL-001',
    };
    const expectedMedidor = {
      medidorId: BigInt(1),
      numeroSerie: dto.numeroSerie,
      modelo: dto.modelo,
      marca: dto.marca,
      estado: EstadoMedidor.BODEGA,
    };

    mockPrismaService.medidores.create.mockResolvedValue(
      expectedMedidor as any,
    );

    const result = await useCase.execute(dto);

    expect(result.numeroSerie).toBe(dto.numeroSerie);
    expect(result.estado).toBe(EstadoMedidor.BODEGA);
  });
});
