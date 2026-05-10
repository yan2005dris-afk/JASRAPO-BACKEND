import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindOneConvenioUseCase } from './find-one-convenio.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('FindOneConvenioUseCase', () => {
  let useCase: FindOneConvenioUseCase;

  const mockConvenioFromDb = {
    convenioId: BigInt(1),
    contratoId: BigInt(1),
    numeroCuotas: 6,
    abonoInicial: { valueOf: () => 50 },
    deudaTotal: { valueOf: () => 215.75 },
    diasMoraActual: 30,
    estado: {
      estadoConvenioId: BigInt(1),
      codigo: 'PREPARADO',
      nombre: 'Preparado',
    },
    fechaAprobacion: null,
    fechaPrimerPago: new Date('2026-06-01'),
    fechaProximoPago: new Date('2026-06-01'),
    montoPagadoActual: { valueOf: () => 0 },
    motivo: null,
    createdAt: new Date('2026-05-10'),
    cuotaConvenio: [],
  };

  const mockPrisma = {
    convenios: { findUnique: jest.fn() },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindOneConvenioUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<FindOneConvenioUseCase>(FindOneConvenioUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return the convenio when found', async () => {
    mockPrisma.convenios.findUnique.mockResolvedValue(mockConvenioFromDb);

    const result = await useCase.execute(BigInt(1));

    expect(result).toBeDefined();
    expect(result.convenioId).toEqual(BigInt(1));
    expect(result.estado.codigo).toBe('PREPARADO');
    expect(mockPrisma.convenios.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { convenioId: BigInt(1) } }),
    );
  });

  it('should throw NotFoundException when convenio not found', async () => {
    mockPrisma.convenios.findUnique.mockResolvedValue(null);

    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      NotFoundException,
    );
    await expect(useCase.execute(BigInt(999))).rejects.toThrow(
      'Convenio con ID 999 no encontrado',
    );
  });
});
