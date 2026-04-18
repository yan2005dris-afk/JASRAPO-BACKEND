import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { LecturaService } from './lectura.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { LecturaEntity } from './entities/lectura.entity';

describe('LecturaService', () => {
  let service: LecturaService;

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
    periodoId: 1,
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
        periodoId: 1,
        lecturaInicial: false,
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
  });

  describe('buscarLecturas', () => {
    it('should return all non-deleted lecturas', async () => {
      mockPrismaService.lecturas.findMany.mockResolvedValue([mockLecturaData]);

      const result = await service.buscarLecturas({});

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LecturaEntity);
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
  });
});
