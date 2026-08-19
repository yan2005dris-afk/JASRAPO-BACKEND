import { PrismaRouteRepository } from './prisma-route.repository';
import type { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

describe('PrismaRouteRepository', () => {
  let repository: PrismaRouteRepository;
  let prisma: {
    rutas: {
      findFirst: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
      count: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
    usuarios: {
      findUnique: jest.Mock;
    };
    comunidades: {
      findUnique: jest.Mock;
    };
    sectores: {
      findUnique: jest.Mock;
    };
    periodos: {
      findUnique: jest.Mock;
    };
    medidores: {
      findUnique: jest.Mock;
    };
    lecturas: {
      findMany: jest.Mock;
      count: jest.Mock;
      groupBy: jest.Mock;
    };
  };

  const rawRoute = {
    rutaId: 1n,
    nombre: 'Ruta 1',
    descripcion: 'Desc',
    operarioId: 10,
    tipoRuta: 'TOMA_LECTURA',
    comunidadId: 1,
    sectorId: null,
    periodoId: 1,
    estado: 'PENDIENTE',
    fechaPlanificada: new Date('2026-01-01'),
    fechaInicio: null,
    fechaFin: null,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    deletedAt: null,
  };

  beforeEach(() => {
    prisma = {
      rutas: {
        findFirst: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
      usuarios: {
        findUnique: jest.fn(),
      },
      comunidades: {
        findUnique: jest.fn(),
      },
      sectores: {
        findUnique: jest.fn(),
      },
      periodos: {
        findUnique: jest.fn(),
      },
      medidores: {
        findUnique: jest.fn(),
      },
      lecturas: {
        findMany: jest.fn(),
        count: jest.fn(),
        groupBy: jest.fn(),
      },
    };
    repository = new PrismaRouteRepository(prisma as unknown as PrismaService);
  });

  describe('findById', () => {
    it('should find active route by ID by default', async () => {
      prisma.rutas.findFirst.mockResolvedValue(rawRoute);

      const result = await repository.findById(1n);

      expect(result?.rutaId).toBe(1n);
      expect(prisma.rutas.findFirst).toHaveBeenCalledWith({
        where: { rutaId: 1n, deletedAt: null },
      });
    });

    it('should find route including deleted when requested', async () => {
      prisma.rutas.findFirst.mockResolvedValue({
        ...rawRoute,
        deletedAt: new Date(),
      });

      const result = await repository.findById(1n, true);

      expect(result?.rutaId).toBe(1n);
      expect(prisma.rutas.findFirst).toHaveBeenCalledWith({
        where: { rutaId: 1n },
      });
    });
  });

  describe('paginateRutas', () => {
    it('should paginate routes with filters', async () => {
      prisma.rutas.findMany.mockResolvedValue([rawRoute]);
      prisma.rutas.count.mockResolvedValue(1);

      const result = await repository.paginateRutas(
        { estado: 'PENDIENTE', comunidadId: 1 },
        { skip: 0, take: 10 },
      );

      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].rutaId).toBe(1n);
    });
  });

  describe('create', () => {
    it('should create route and return domain entity', async () => {
      prisma.rutas.create.mockResolvedValue(rawRoute);

      const result = await repository.create({
        nombre: 'Ruta 1',
        operarioId: 10,
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        periodoId: 1,
      });

      expect(result.rutaId).toBe(1n);
    });

    it('should throw EntityAlreadyExistsException on P2002 error', async () => {
      const p2002 = new Prisma.PrismaClientKnownRequestError('Duplicate', {
        code: 'P2002',
        clientVersion: '7.0.0',
      });
      prisma.rutas.create.mockRejectedValue(p2002);

      await expect(
        repository.create({
          nombre: 'Ruta 1',
          operarioId: 10,
          tipoRuta: 'TOMA_LECTURA',
          comunidadId: 1,
          periodoId: 1,
        }),
      ).rejects.toThrow(EntityAlreadyExistsException);
    });
  });

  describe('update', () => {
    it('should update route and return entity', async () => {
      prisma.rutas.update.mockResolvedValue({
        ...rawRoute,
        nombre: 'Ruta Modificada',
      });

      const result = await repository.update(1n, { nombre: 'Ruta Modificada' });

      expect(result.nombre).toBe('Ruta Modificada');
    });

    it('should throw EntityNotFoundException on P2025 error', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prisma.rutas.update.mockRejectedValue(p2025);

      await expect(repository.update(99n, { nombre: 'Test' })).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('softDelete', () => {
    it('should soft delete route', async () => {
      prisma.rutas.update.mockResolvedValue({
        ...rawRoute,
        deletedAt: new Date(),
      });

      const result = await repository.softDelete(1n);

      expect(result.rutaId).toBe(1n);
    });

    it('should throw EntityNotFoundException on P2025 error', async () => {
      const p2025 = new Prisma.PrismaClientKnownRequestError('Not found', {
        code: 'P2025',
        clientVersion: '7.0.0',
      });
      prisma.rutas.update.mockRejectedValue(p2025);

      await expect(repository.softDelete(99n)).rejects.toThrow(
        EntityNotFoundException,
      );
    });
  });

  describe('cross-module lookups', () => {
    it('findUsuario should find user with optional role', async () => {
      prisma.usuarios.findUnique.mockResolvedValue({
        usuarioId: 1,
        rol: { nombre: 'operadores' },
      });

      const result = await repository.findUsuario(1, { includeRole: true });

      expect(result?.usuarioId).toBe(1);
      expect(result?.rol?.nombre).toBe('operadores');
    });

    it('findComunidad should find community', async () => {
      prisma.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });

      const result = await repository.findComunidad(1);

      expect(result?.comunidadId).toBe(1);
    });

    it('findSector should find sector', async () => {
      prisma.sectores.findUnique.mockResolvedValue({
        sectorId: 1,
        comunidadId: 1,
      });

      const result = await repository.findSector(1);

      expect(result?.sectorId).toBe(1);
    });

    it('findPeriodo should find period', async () => {
      prisma.periodos.findUnique.mockResolvedValue({
        periodoId: 1,
        estado: 'ABIERTO',
      });

      const result = await repository.findPeriodo(1);

      expect(result?.periodoId).toBe(1);
    });

    it('findMedidor should find meter', async () => {
      prisma.medidores.findUnique.mockResolvedValue({
        medidorId: 10n,
        serie: 'MED-010',
      });

      const result = await repository.findMedidor(10);

      expect(result?.medidorId).toBe(10);
      expect(result?.serie).toBe('MED-010');
    });

    it('findOverlappingRoutes should query and map overlapping routes', async () => {
      prisma.rutas.findMany.mockResolvedValue([rawRoute]);

      const result = await repository.findOverlappingRoutes(1, 1, 2);

      expect(result).toHaveLength(1);
      expect(result[0].rutaId).toBe(1n);
    });
  });

  describe('paginateLecturas', () => {
    it('should query and return mapped reading entities', async () => {
      const rawLectura = {
        lecturaId: 10n,
        medidor: {
          historial: [
            {
              fechaHasta: null,
              contrato: {
                numeroGuia: 'G-100',
                direccionSuministro: 'Av. Principal',
                estado: 'ACTIVO',
                cliente: { nombres: 'Juan', apellidos: 'Perez' },
                sector: { nombre: 'Sector 1' },
              },
            },
          ],
        },
      };

      prisma.lecturas.findMany.mockResolvedValue([rawLectura]);
      prisma.lecturas.count.mockResolvedValue(1);
      prisma.lecturas.groupBy.mockResolvedValue([
        { estado: 'PENDIENTE', _count: { _all: 1 } },
      ]);

      const result = await repository.paginateLecturas(
        {
          tipoRuta: 'TOMA_LECTURA',
          comunidadId: 1,
          search: 'Juan',
        },
        { skip: 0, take: 10 },
      );

      expect(result.meta.total).toBe(1);
      expect(result.data).toHaveLength(1);
      expect(result.data[0].lecturaId).toBe(10n);
      expect(result.data[0].guia).toBe('G-100');
    });
  });
});
