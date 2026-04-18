import { Test, TestingModule } from '@nestjs/testing';
import { LecturaService } from './lectura.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { LecturaEntity } from './entities/lectura.entity';

describe('LecturaService', () => {
  let service: LecturaService;
  let prismaService: PrismaService;

  const mockLecturaData = {
    lecturaId: BigInt(1),
    fecha: new Date('2024-01-15'),
    lecturaAnterior: 100,
    lecturaActual: 150,
    consumoCalculado: 50,
    contratoId: BigInt(1),
    createdAt: new Date(),
    descripcionAnomalia: null,
    fechaValidacion: null,
    fotoUrlMinIo: null,
    isValidada: false,
    lecturaInicial: false,
    periodo: '2024-01',
    tieneAnomalia: false,
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    lecturas: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LecturaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<LecturaService>(LecturaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearLectura', () => {
    it('should create lectura with default isValidada false', async () => {
      mockPrismaService.lecturas.create.mockResolvedValue(mockLecturaData);

      const result = await service.crearLectura({
        fecha: '2024-01-15',
        lecturaAnterior: 100,
        lecturaActual: 150,
        consumoCalculado: 50,
        contratoId: '1',
        periodo: '2024-01',
      });

      expect(result).toBeInstanceOf(LecturaEntity);
      expect(mockPrismaService.lecturas.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lecturaAnterior: 100,
            lecturaActual: 150,
            consumoCalculado: 50,
            contratoId: BigInt(1),
            isValidada: false,
            tieneAnomalia: false,
          }),
        }),
      );
    });

    it('should create lectura with explicit isValidada true', async () => {
      const validadaLectura = { ...mockLecturaData, isValidada: true };
      mockPrismaService.lecturas.create.mockResolvedValue(validadaLectura);

      const result = await service.crearLectura({
        fecha: '2024-01-15',
        lecturaAnterior: 100,
        lecturaActual: 150,
        consumoCalculado: 50,
        contratoId: '1',
        periodo: '2024-01',
        isValidada: true,
      });

      expect(result.isValidada).toBe(true);
    });

    it('should create lectura with tieneAnomalia true', async () => {
      const anomaliaLectura = { ...mockLecturaData, tieneAnomalia: true };
      mockPrismaService.lecturas.create.mockResolvedValue(anomaliaLectura);

      const result = await service.crearLectura({
        fecha: '2024-01-15',
        lecturaAnterior: 100,
        lecturaActual: 150,
        consumoCalculado: 50,
        contratoId: '1',
        periodo: '2024-01',
        tieneAnomalia: true,
        descripcionAnomalia: 'Lectura fuera de rango',
      });

      expect(result.tieneAnomalia).toBe(true);
    });
  });

  describe('buscarLecturas', () => {
    it('should return all non-deleted lecturas', async () => {
      mockPrismaService.lecturas.findMany.mockResolvedValue([mockLecturaData]);

      const result = await service.buscarLecturas({});

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LecturaEntity);
      expect(mockPrismaService.lecturas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          orderBy: { fecha: 'desc' },
        }),
      );
    });

    it('should return empty array when no lecturas exist', async () => {
      mockPrismaService.lecturas.findMany.mockResolvedValue([]);

      const result = await service.buscarLecturas({});

      expect(result).toEqual([]);
    });

    it('should apply pagination', async () => {
      mockPrismaService.lecturas.findMany.mockResolvedValue([mockLecturaData]);

      await service.buscarLecturas({ skip: 0, take: 10 });

      expect(mockPrismaService.lecturas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: { deletedAt: null },
        }),
      );
    });

    it('should apply where filters', async () => {
      mockPrismaService.lecturas.findMany.mockResolvedValue([mockLecturaData]);

      await service.buscarLecturas({
        where: { periodo: '2024-01' },
      });

      expect(mockPrismaService.lecturas.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, periodo: '2024-01' },
        }),
      );
    });
  });

  describe('buscarLectura', () => {
    it('should return lectura by id', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLecturaData);

      const result = await service.buscarLectura(BigInt(1));

      expect(result).toBeInstanceOf(LecturaEntity);
      expect(result.lecturaId).toBe('1');
    });

    it('should throw NotFoundException when lectura not found', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(null);

      await expect(service.buscarLectura(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when lectura is deleted', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue({
        ...mockLecturaData,
        deletedAt: new Date(),
      });

      await expect(service.buscarLectura(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('actualizarLectura', () => {
    it('should update lectura successfully', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLecturaData);
      mockPrismaService.lecturas.update.mockResolvedValue({
        ...mockLecturaData,
        lecturaActual: 200,
      });

      const result = await service.actualizarLectura(BigInt(1), {
        lecturaActual: 200,
      });

      expect(result.lecturaActual).toBe(200);
    });

    it('should throw NotFoundException when lectura does not exist', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarLectura(BigInt(999), { lecturaActual: 200 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should convert contratoId to BigInt', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLecturaData);
      mockPrismaService.lecturas.update.mockResolvedValue(mockLecturaData);

      await service.actualizarLectura(BigInt(1), {
        contratoId: '2',
      });

      expect(mockPrismaService.lecturas.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            contratoId: BigInt(2),
          }),
        }),
      );
    });

    it('should convert fecha to Date', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLecturaData);
      mockPrismaService.lecturas.update.mockResolvedValue(mockLecturaData);

      await service.actualizarLectura(BigInt(1), {
        fecha: '2024-02-01',
      });

      expect(mockPrismaService.lecturas.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            fecha: new Date('2024-02-01'),
          }),
        }),
      );
    });
  });

  describe('eliminarLectura', () => {
    it('should soft delete lectura', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(mockLecturaData);
      mockPrismaService.lecturas.update.mockResolvedValue({
        ...mockLecturaData,
        deletedAt: new Date(),
      });

      const result = await service.eliminarLectura(BigInt(1));

      expect(result.message).toContain('eliminada');
    });

    it('should throw NotFoundException when lectura not found', async () => {
      mockPrismaService.lecturas.findUnique.mockResolvedValue(null);

      await expect(service.eliminarLectura(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});