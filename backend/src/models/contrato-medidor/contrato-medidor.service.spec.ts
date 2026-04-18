import { Test, TestingModule } from '@nestjs/testing';
import { ContratoMedidorService } from './contrato-medidor.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ContratoMedidorService', () => {
  let service: ContratoMedidorService;
  let prismaService: PrismaService;

  const mockContratoMedidor = {
    contratoMedidorId: BigInt(1),
    contratoId: BigInt(1),
    medidorId: BigInt(1),
    fechaInicio: new Date('2024-01-01'),
    fechaFin: null,
    motivoCambio: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    contratoMedidor: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearContrato', () => {
    it('should create contrato-medidor link', async () => {
      mockPrismaService.contratoMedidor.create.mockResolvedValue(
        mockContratoMedidor,
      );

      const result = await service.crearContrato({
        contratoId: '1',
        medidorId: '1',
      });

      expect(result.contratoId).toBe(BigInt(1));
      expect(result.medidorId).toBe(BigInt(1));
      expect(mockPrismaService.contratoMedidor.create).toHaveBeenCalledWith({
        data: {
          contratoId: BigInt(1),
          medidorId: BigInt(1),
          fechaInicio: expect.any(Date),
          motivoCambio: undefined,
        },
      });
    });

    it('should use provided fechaInicio', async () => {
      const customDate = new Date('2024-06-01');
      mockPrismaService.contratoMedidor.create.mockResolvedValue({
        ...mockContratoMedidor,
        fechaInicio: customDate,
      });

      const result = await service.crearContrato({
        contratoId: '1',
        medidorId: '1',
        fechaInicio: customDate,
      });

      expect(result.fechaInicio).toBe(customDate);
    });

    it('should include motivoCambio when provided', async () => {
      mockPrismaService.contratoMedidor.create.mockResolvedValue({
        ...mockContratoMedidor,
        motivoCambio: 'New installation',
      });

      const result = await service.crearContrato({
        contratoId: '1',
        medidorId: '1',
        motivoCambio: 'New installation',
      });

      expect(result.motivoCambio).toBe('New installation');
    });
  });

  describe('buscarContratos', () => {
    it('should return all non-deleted contrato-medidor links', async () => {
      mockPrismaService.contratoMedidor.findMany.mockResolvedValue([
        mockContratoMedidor,
      ]);

      const result = await service.buscarContratos({});

      expect(result).toEqual([mockContratoMedidor]);
      expect(mockPrismaService.contratoMedidor.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no links exist', async () => {
      mockPrismaService.contratoMedidor.findMany.mockResolvedValue([]);

      const result = await service.buscarContratos({});

      expect(result).toEqual([]);
    });

    it('should apply where filters', async () => {
      mockPrismaService.contratoMedidor.findMany.mockResolvedValue([
        mockContratoMedidor,
      ]);

      await service.buscarContratos({
        where: { contratoId: BigInt(1) },
      });

      expect(mockPrismaService.contratoMedidor.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, contratoId: BigInt(1) },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should apply pagination', async () => {
      mockPrismaService.contratoMedidor.findMany.mockResolvedValue([
        mockContratoMedidor,
      ]);

      await service.buscarContratos({ skip: 0, take: 10 });

      expect(mockPrismaService.contratoMedidor.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('buscarContrato', () => {
    it('should return contrato-medidor by id', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(
        mockContratoMedidor,
      );

      const result = await service.buscarContrato(BigInt(1));

      expect(result).toEqual(mockContratoMedidor);
    });

    it('should throw NotFoundException when link not found', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(null);

      await expect(service.buscarContrato(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when link is deleted', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue({
        ...mockContratoMedidor,
        deletedAt: new Date(),
      });

      await expect(service.buscarContrato(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('actualizar', () => {
    it('should update contrato-medidor successfully', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(
        mockContratoMedidor,
      );
      mockPrismaService.contratoMedidor.update.mockResolvedValue({
        ...mockContratoMedidor,
        motivoCambio: 'Updated reason',
      });

      const result = await service.actualizar(BigInt(1), {
        motivoCambio: 'Updated reason',
      });

      expect(result.motivoCambio).toBe('Updated reason');
    });

    it('should throw NotFoundException when link does not exist', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizar(BigInt(999), { motivoCambio: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('finalizarVinculo', () => {
    it('should set fechaFin on existing link', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(
        mockContratoMedidor,
      );
      mockPrismaService.contratoMedidor.update.mockResolvedValue({
        ...mockContratoMedidor,
        fechaFin: new Date(),
        motivoCambio: 'Completed',
      });

      const result = await service.finalizarVinculo(BigInt(1), 'Completed');

      expect(result.fechaFin).toBeDefined();
      expect(result.motivoCambio).toBe('Completed');
    });

    it('should use default motivoCambio when not provided', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(
        mockContratoMedidor,
      );
      mockPrismaService.contratoMedidor.update.mockResolvedValue({
        ...mockContratoMedidor,
        fechaFin: new Date(),
        motivoCambio: 'Cambio de equipo o fin de contrato',
      });

      const result = await service.finalizarVinculo(BigInt(1));

      expect(result.motivoCambio).toBe('Cambio de equipo o fin de contrato');
    });

    it('should throw NotFoundException when link does not exist', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(null);

      await expect(service.finalizarVinculo(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('eliminar', () => {
    it('should soft delete link', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(
        mockContratoMedidor,
      );
      mockPrismaService.contratoMedidor.update.mockResolvedValue({
        ...mockContratoMedidor,
        deletedAt: new Date(),
      });

      const result = await service.eliminar(BigInt(1));

      expect(result.message).toContain('eliminado');
    });

    it('should throw NotFoundException when link not found', async () => {
      mockPrismaService.contratoMedidor.findUnique.mockResolvedValue(null);

      await expect(service.eliminar(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});