import { Test, TestingModule } from '@nestjs/testing';
import { MedidorService } from './medidor.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { EstadoMedidor } from 'src/generated/prisma/enums';

describe('MedidorService', () => {
  let service: MedidorService;
  let prismaService: PrismaService;

  const mockMedidor = {
    medidorId: BigInt(1),
    numeroMedidor: 'M001',
    marca: 'Generic',
    modelo: 'Model X',
    estado: EstadoMedidor.BODEGA,
    fechaBaja: null,
    motivoBaja: null,
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
    contratoMedidor: {
      create: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
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
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearMedidor', () => {
    it('should create medidor with BODEGA state', async () => {
      mockPrismaService.medidores.create.mockResolvedValue(mockMedidor);

      const result = await service.crearMedidor({
        numeroMedidor: 'M001',
        marca: 'Generic',
        modelo: 'Model X',
      });

      expect(result.numeroMedidor).toBe('M001');
      expect(result.estado).toBe(EstadoMedidor.BODEGA);
      expect(mockPrismaService.medidores.create).toHaveBeenCalledWith({
        data: {
          numeroMedidor: 'M001',
          marca: 'Generic',
          modelo: 'Model X',
          estado: EstadoMedidor.BODEGA,
        },
      });
    });
  });

  describe('buscarMedidores', () => {
    it('should return all non-deleted medidores', async () => {
      mockPrismaService.medidores.findMany.mockResolvedValue([mockMedidor]);

      const result = await service.buscarMedidores({});

      expect(result).toEqual([mockMedidor]);
      expect(mockPrismaService.medidores.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return empty array when no medidores exist', async () => {
      mockPrismaService.medidores.findMany.mockResolvedValue([]);

      const result = await service.buscarMedidores({});

      expect(result).toEqual([]);
    });

    it('should apply where filters', async () => {
      mockPrismaService.medidores.findMany.mockResolvedValue([mockMedidor]);

      await service.buscarMedidores({
        where: { estado: EstadoMedidor.INSTALADO },
      });

      expect(mockPrismaService.medidores.findMany).toHaveBeenCalledWith({
        where: { deletedAt: null, estado: EstadoMedidor.INSTALADO },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('buscarMedidor', () => {
    it('should return medidor by id', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);

      const result = await service.buscarMedidor(BigInt(1));

      expect(result).toEqual(mockMedidor);
    });

    it('should throw NotFoundException when medidor not found', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(null);

      await expect(service.buscarMedidor(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when medidor is deleted', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue({
        ...mockMedidor,
        deletedAt: new Date(),
      });

      await expect(service.buscarMedidor(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('actualizarMedidor', () => {
    it('should update medidor successfully', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);
      mockPrismaService.medidores.update.mockResolvedValue({
        ...mockMedidor,
        marca: 'Updated',
      });

      const result = await service.actualizarMedidor(BigInt(1), {
        marca: 'Updated',
      });

      expect(result.marca).toBe('Updated');
    });

    it('should throw NotFoundException when medidor does not exist', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarMedidor(BigInt(999), { marca: 'Updated' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('eliminarMedidor', () => {
    it('should soft delete medidor', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);
      mockPrismaService.medidores.update.mockResolvedValue({
        ...mockMedidor,
        deletedAt: new Date(),
      });

      const result = await service.eliminarMedidor(BigInt(1));

      expect(result.message).toContain('eliminado');
    });

    it('should throw NotFoundException when medidor not found', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(null);

      await expect(service.eliminarMedidor(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('instalarMedidor', () => {
    it('should install medidor and create contrato-medidor link', async () => {
      const installedMedidor = {
        ...mockMedidor,
        estado: EstadoMedidor.INSTALADO,
      };

      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);
      mockPrismaService.$transaction.mockImplementation(async (promises) => {
        // When passed an array of promises, resolve them and return results
        const results = await Promise.all(promises);
        return results;
      });
      mockPrismaService.medidores.update.mockResolvedValue(installedMedidor);
      mockPrismaService.contratoMedidor.create.mockResolvedValue({
        contratoMedidorId: BigInt(1),
        medidorId: BigInt(1),
        contratoId: BigInt(1),
      });

      const result = await service.instalarMedidor(BigInt(1), BigInt(1));

      expect(result.estado).toBe(EstadoMedidor.INSTALADO);
      expect(mockPrismaService.contratoMedidor.create).toHaveBeenCalledWith({
        data: { medidorId: BigInt(1), contratoId: BigInt(1) },
      });
    });

    it('should install medidor from ESTIMADO state', async () => {
      const estimatedMedidor = {
        ...mockMedidor,
        estado: EstadoMedidor.ESTIMADO,
      };
      const installedMedidor = {
        ...estimatedMedidor,
        estado: EstadoMedidor.INSTALADO,
      };

      mockPrismaService.medidores.findUnique.mockResolvedValue(estimatedMedidor);
      mockPrismaService.$transaction.mockImplementation(async (promises) => {
        const results = await Promise.all(promises);
        return results;
      });
      mockPrismaService.medidores.update.mockResolvedValue(installedMedidor);
      mockPrismaService.contratoMedidor.create.mockResolvedValue({});

      const result = await service.instalarMedidor(BigInt(1), BigInt(1));

      expect(result.estado).toBe(EstadoMedidor.INSTALADO);
    });

    it('should throw BadRequestException when medidor is not in BODEGA or ESTIMADO', async () => {
      const installedMedidor = {
        ...mockMedidor,
        estado: EstadoMedidor.INSTALADO,
      };

      mockPrismaService.medidores.findUnique.mockResolvedValue(installedMedidor);

      await expect(
        service.instalarMedidor(BigInt(1), BigInt(1)),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('reportarDano', () => {
    it('should report damage for installed medidor', async () => {
      const installedMedidor = {
        ...mockMedidor,
        estado: EstadoMedidor.INSTALADO,
      };
      const damagedMedidor = {
        ...installedMedidor,
        estado: EstadoMedidor.DANADO,
      };

      mockPrismaService.medidores.findUnique.mockResolvedValue(installedMedidor);
      mockPrismaService.medidores.update.mockResolvedValue(damagedMedidor);

      const result = await service.reportarDano(BigInt(1));

      expect(result.estado).toBe(EstadoMedidor.DANADO);
    });

    it('should throw BadRequestException when medidor is not INSTALADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);

      await expect(service.reportarDano(BigInt(1))).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('facturarPorPromedio', () => {
    it('should change damaged medidor to ESTIMADO', async () => {
      const damagedMedidor = {
        ...mockMedidor,
        estado: EstadoMedidor.DANADO,
      };
      const estimatedMedidor = {
        ...damagedMedidor,
        estado: EstadoMedidor.ESTIMADO,
      };

      mockPrismaService.medidores.findUnique.mockResolvedValue(damagedMedidor);
      mockPrismaService.medidores.update.mockResolvedValue(estimatedMedidor);

      const result = await service.facturarPorPromedio(BigInt(1));

      expect(result.estado).toBe(EstadoMedidor.ESTIMADO);
    });

    it('should throw BadRequestException when medidor is not DANADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);

      await expect(
        service.facturarPorPromedio(BigInt(1)),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('darDeBaja', () => {
    it('should baja damaged medidor', async () => {
      const damagedMedidor = {
        ...mockMedidor,
        estado: EstadoMedidor.DANADO,
      };
      const bajaMedidor = {
        ...damagedMedidor,
        estado: EstadoMedidor.BAJA,
        fechaBaja: new Date(),
        motivoBaja: 'Replacement',
      };

      mockPrismaService.medidores.findUnique.mockResolvedValue(damagedMedidor);
      mockPrismaService.medidores.update.mockResolvedValue(bajaMedidor);

      const result = await service.darDeBaja(BigInt(1), 'Replacement');

      expect(result.estado).toBe(EstadoMedidor.BAJA);
      expect(result.motivoBaja).toBe('Replacement');
      expect(result.fechaBaja).toBeDefined();
    });

    it('should throw BadRequestException when medidor is not DANADO', async () => {
      mockPrismaService.medidores.findUnique.mockResolvedValue(mockMedidor);

      await expect(service.darDeBaja(BigInt(1), 'Reason')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});