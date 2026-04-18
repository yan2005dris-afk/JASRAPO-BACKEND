import { Test, TestingModule } from '@nestjs/testing';
import { NovedadOperativaService } from './novedad-operativa.service';
import { PrismaService } from 'src/database/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TipoNovedad, EstadoNovedad } from 'src/generated/prisma/enums';
import { NovedadOperativaEntity } from './entities/novedad-operativa.entity';

describe('NovedadOperativaService', () => {
  let service: NovedadOperativaService;
  let prismaService: PrismaService;

  const mockNovedadData = {
    novedadId: BigInt(1),
    lecturaId: BigInt(1),
    observacion: 'Test observation',
    tipo: TipoNovedad.FUGA,
    estado: EstadoNovedad.PENDIENTE,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockPrismaService = {
    novedadOperativa: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NovedadOperativaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<NovedadOperativaService>(NovedadOperativaService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('crearNovedadOperativa', () => {
    it('should create novedad operativa', async () => {
      mockPrismaService.novedadOperativa.create.mockResolvedValue(
        mockNovedadData,
      );

      const result = await service.crearNovedadOperativa({
        lecturaId: '1',
        observacion: 'Test observation',
        tipo: TipoNovedad.FUGA,
        estado: EstadoNovedad.PENDIENTE,
      });

      expect(result).toBeInstanceOf(NovedadOperativaEntity);
      expect(result.tipo).toBe(TipoNovedad.FUGA);
      expect(result.estado).toBe(EstadoNovedad.PENDIENTE);
    });

    it('should create with different tipo', async () => {
      const otraNovedad = {
        ...mockNovedadData,
        tipo: TipoNovedad.MEDIDOR_DANADO,
      };
      mockPrismaService.novedadOperativa.create.mockResolvedValue(otraNovedad);

      const result = await service.crearNovedadOperativa({
        lecturaId: '1',
        observacion: 'Medidor dañado',
        tipo: TipoNovedad.MEDIDOR_DANADO,
        estado: EstadoNovedad.PENDIENTE,
      });

      expect(result.tipo).toBe(TipoNovedad.MEDIDOR_DANADO);
    });

    it('should create with different estado', async () => {
      const resolvedNovedad = {
        ...mockNovedadData,
        estado: EstadoNovedad.RESUELTA,
      };
      mockPrismaService.novedadOperativa.create.mockResolvedValue(
        resolvedNovedad,
      );

      const result = await service.crearNovedadOperativa({
        lecturaId: '1',
        observacion: 'Fixed',
        tipo: TipoNovedad.LECTURA_ERRONEA,
        estado: EstadoNovedad.RESUELTA,
      });

      expect(result.estado).toBe(EstadoNovedad.RESUELTA);
    });
  });

  describe('buscarNovedades', () => {
    it('should return all non-deleted novedades', async () => {
      mockPrismaService.novedadOperativa.findMany.mockResolvedValue([
        mockNovedadData,
      ]);

      const result = await service.buscarNovedades({});

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(NovedadOperativaEntity);
      expect(mockPrismaService.novedadOperativa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should return empty array when no novedades exist', async () => {
      mockPrismaService.novedadOperativa.findMany.mockResolvedValue([]);

      const result = await service.buscarNovedades({});

      expect(result).toEqual([]);
    });

    it('should apply pagination', async () => {
      mockPrismaService.novedadOperativa.findMany.mockResolvedValue([
        mockNovedadData,
      ]);

      await service.buscarNovedades({ skip: 0, take: 10 });

      expect(mockPrismaService.novedadOperativa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
          where: { deletedAt: null },
        }),
      );
    });

    it('should apply where filters', async () => {
      mockPrismaService.novedadOperativa.findMany.mockResolvedValue([
        mockNovedadData,
      ]);

      await service.buscarNovedades({
        where: { tipo: TipoNovedad.FUGA },
      });

      expect(mockPrismaService.novedadOperativa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null, tipo: TipoNovedad.FUGA },
        }),
      );
    });
  });

  describe('buscarNovedad', () => {
    it('should return novedad by id', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(
        mockNovedadData,
      );

      const result = await service.buscarNovedad(BigInt(1));

      expect(result).toBeInstanceOf(NovedadOperativaEntity);
      expect(result.novedadId).toBe('1');
    });

    it('should throw NotFoundException when lectura not found', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(null);

      await expect(service.buscarNovedad(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when lectura is deleted', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue({
        ...mockNovedadData,
        deletedAt: new Date(),
      });

      await expect(service.buscarNovedad(BigInt(1))).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('actualizarNovedad', () => {
    it('should update lectura successfully', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(
        mockNovedadData,
      );
      mockPrismaService.novedadOperativa.update.mockResolvedValue({
        ...mockNovedadData,
        estado: EstadoNovedad.RESUELTA,
      });

      const result = await service.actualizarNovedad(BigInt(1), {
        estado: EstadoNovedad.RESUELTA,
      });

      expect(result.estado).toBe(EstadoNovedad.RESUELTA);
    });

    it('should throw NotFoundException when lectura does not exist', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(null);

      await expect(
        service.actualizarNovedad(BigInt(999), { estado: EstadoNovedad.RESUELTA }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should convert lecturaId to BigInt', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(
        mockNovedadData,
      );
      mockPrismaService.novedadOperativa.update.mockResolvedValue(mockNovedadData);

      await service.actualizarNovedad(BigInt(1), {
        lecturaId: '2',
      });

      expect(mockPrismaService.novedadOperativa.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            lecturaId: BigInt(2),
          }),
        }),
      );
    });
  });

  describe('eliminarNovedad', () => {
    it('should soft delete lectura', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(
        mockNovedadData,
      );
      mockPrismaService.novedadOperativa.update.mockResolvedValue({
        ...mockNovedadData,
        deletedAt: new Date(),
      });

      const result = await service.eliminarNovedad(BigInt(1));

      expect(result.message).toContain('eliminada');
    });

    it('should throw NotFoundException when lectura not found', async () => {
      mockPrismaService.novedadOperativa.findUnique.mockResolvedValue(null);

      await expect(service.eliminarNovedad(BigInt(999))).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});