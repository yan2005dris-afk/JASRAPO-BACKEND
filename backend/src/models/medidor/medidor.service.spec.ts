import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { MedidorService } from './medidor.service';
import { PrismaService } from 'src/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoMedidor } from 'src/generated/prisma/enums';

describe('MedidorService', () => {
  let service: MedidorService;

  const mockMedidor = {
    medidorId: BigInt(1),
    serie: 'MED-001',
    estado: EstadoMedidor.BODEGA,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    medidores: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MedidorService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MedidorService>(MedidorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('instalarMedidor', () => {
    it('should install medidor and link to contrato', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);
      mockPrismaService.medidores.update.mockResolvedValue({
        ...mockMedidor,
        estado: EstadoMedidor.INSTALADO,
        contratoId: BigInt(1),
      });

      const result = await service.instalarMedidor(BigInt(1), BigInt(1));

      expect(result.estado).toBe(EstadoMedidor.INSTALADO);
      expect(mockPrismaService.medidores.update).toHaveBeenCalledWith({
        where: { medidorId: BigInt(1) },
        data: {
          estado: EstadoMedidor.INSTALADO,
          contratoId: BigInt(1),
        },
      });
    });

    it('should throw BadRequestException if medidor is not in BODEGA or ESTIMADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidor,
        estado: EstadoMedidor.INSTALADO,
      });

      await expect(
        service.instalarMedidor(BigInt(1), BigInt(1)),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reportarDano', () => {
    it('should change status to DANADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidor,
        estado: EstadoMedidor.INSTALADO,
      });
      mockPrismaService.medidores.update.mockResolvedValue({
        ...mockMedidor,
        estado: EstadoMedidor.DANADO,
      });

      const result = await service.reportarDano(BigInt(1));

      expect(result.estado).toBe(EstadoMedidor.DANADO);
    });
  });
});
