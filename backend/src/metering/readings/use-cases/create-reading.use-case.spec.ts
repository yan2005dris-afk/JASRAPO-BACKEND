import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateReadingUseCase } from './create-reading.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('CreateReadingUseCase', () => {
  let useCase: CreateReadingUseCase;

  const mockPrismaService = {
    lecturas: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateReadingUseCase,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    useCase = module.get<CreateReadingUseCase>(CreateReadingUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should create a reading', async () => {
    const dto = {
      fecha: new Date('2026-01-15'),
      lecturaAnterior: 100,
      lecturaActual: 150,
      consumoCalculado: 50,
      contratoId: 1,
      periodoId: 1,
      lecturaInicial: 0,
      tieneAnomalia: false,
      isValidada: false,
    };

    const mockReading = {
      lecturaId: BigInt(1),
      ...dto,
      contratoId: BigInt(1),
      periodoId: BigInt(1),
    };

    mockPrismaService.lecturas.create.mockResolvedValue(mockReading as any);

    const result = await useCase.execute(dto);

    expect(result.lecturaActual).toBe(150);
    expect(mockPrismaService.lecturas.create).toHaveBeenCalled();
  });
});
