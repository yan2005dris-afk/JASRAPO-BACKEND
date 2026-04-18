import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { ContratoMedidorService } from './contrato-medidor.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ContratoMedidorService', () => {
  let service: ContratoMedidorService;

  const mockContrato = {
    contratoId: BigInt(1),
    clienteId: BigInt(1),
    numeroGuia: 'GUIA-001',
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    contratoId: BigInt(1),
  };

  const mockPrismaService = {
    contratos: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    medidores: {
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContratoMedidorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ContratoMedidorService>(ContratoMedidorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearContrato', () => {
    it('should link medidor to contrato', async () => {
      mockPrismaService.medidores.update.mockResolvedValue(mockMedidor);

      const result = await service.crearContrato({
        contratoId: '1',
        medidorId: '1',
      });

      expect(result.contratoId).toBe(BigInt(1));
      expect(mockPrismaService.medidores.update).toHaveBeenCalled();
    });
  });

  describe('buscarContrato', () => {
    it('should return contrato by id', async () => {
      mockPrismaService.contratos.findUnique.mockResolvedValue(mockContrato);

      const result = await service.buscarContrato(BigInt(1));

      expect(result.contratoId).toBe(BigInt(1));
    });

    it('should throw NotFoundException when not found', async () => {
      mockPrismaService.contratos.findUnique.mockResolvedValue(null);

      await expect(service.buscarContrato(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
