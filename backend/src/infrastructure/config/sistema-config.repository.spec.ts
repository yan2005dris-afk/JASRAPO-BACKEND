import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  SistemaConfigRepository,
  SistemaConfigRepositoryError,
} from './sistema-config.repository';

describe('SistemaConfigRepository', () => {
  let repository: SistemaConfigRepository;
  let prisma: jest.Mocked<Pick<PrismaService, 'sistemaConfig'>>;

  const makePrismaMock = () => ({
    sistemaConfig: {
      findUnique: jest.fn(),
    },
  });

  beforeEach(async () => {
    prisma = makePrismaMock() as unknown as jest.Mocked<
      Pick<PrismaService, 'sistemaConfig'>
    >;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SistemaConfigRepository,
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    repository = module.get<SistemaConfigRepository>(SistemaConfigRepository);
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findByClave', () => {
    it('returns the valor string when the key exists', async () => {
      prisma.sistemaConfig.findUnique.mockResolvedValueOnce({
        id: 1,
        clave: 'reporte.estilo.default',
        valor: 'modern',
        descripcion: 'Estilo por defecto',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-01T00:00:00Z'),
      });

      const result = await repository.findByClave('reporte.estilo.default');

      expect(result).toBe('modern');
      expect(prisma.sistemaConfig.findUnique).toHaveBeenCalledWith({
        where: { clave: 'reporte.estilo.default' },
        select: { valor: true },
      });
    });

    it('returns null when the key is absent in the database', async () => {
      prisma.sistemaConfig.findUnique.mockResolvedValueOnce(null);

      const result = await repository.findByClave('reporte.estilo.absent');

      expect(result).toBeNull();
      expect(prisma.sistemaConfig.findUnique).toHaveBeenCalledWith({
        where: { clave: 'reporte.estilo.absent' },
        select: { valor: true },
      });
    });

    it('returns the empty string when valor is an empty string', async () => {
      prisma.sistemaConfig.findUnique.mockResolvedValueOnce({
        id: 1,
        clave: 'reporte.estilo.empty',
        valor: '',
        descripcion: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await repository.findByClave('reporte.estilo.empty');

      expect(result).toBe('');
    });

    it('maps Prisma.PrismaClientKnownRequestError to SistemaConfigRepositoryError', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'connection lost',
        { code: 'P1001', clientVersion: '7.6.0' },
      );
      prisma.sistemaConfig.findUnique.mockRejectedValueOnce(prismaError);

      await expect(repository.findByClave('reporte.estilo.x')).rejects.toBeInstanceOf(
        SistemaConfigRepositoryError,
      );
    });

    it('wraps the original error as the cause when mapping Prisma errors', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'db timeout',
        { code: 'P1008', clientVersion: '7.6.0' },
      );
      prisma.sistemaConfig.findUnique.mockRejectedValueOnce(prismaError);

      try {
        await repository.findByClave('reporte.estilo.x');
        fail('expected SistemaConfigRepositoryError to be thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(SistemaConfigRepositoryError);
        expect((err as SistemaConfigRepositoryError).cause).toBe(prismaError);
      }
    });

    it('rethrows non-Prisma errors unchanged', async () => {
      const generic = new Error('boom');
      prisma.sistemaConfig.findUnique.mockRejectedValueOnce(generic);

      await expect(repository.findByClave('reporte.estilo.x')).rejects.toBe(
        generic,
      );
    });
  });
});
