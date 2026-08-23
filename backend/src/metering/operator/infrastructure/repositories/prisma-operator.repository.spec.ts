import { Test } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import { InvalidDomainOperationException } from 'src/shared/domain/exceptions/domain.exception';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrismaOperatorRepository } from './prisma-operator.repository';

describe('PrismaOperatorRepository routes', () => {
  const prisma = {
    rutas: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  let repository: PrismaOperatorRepository;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        PrismaOperatorRepository,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();
    repository = module.get(PrismaOperatorRepository);
  });

  it('builds route stops exclusively from assigned work orders', async () => {
    prisma.rutas.findMany.mockResolvedValue([
      {
        rutaId: 1n,
        nombre: 'Ruta norte',
        medidor: null,
        ordenesTrabajo: [
          {
            ordenTrabajoId: 9n,
            rutaId: 1n,
            tipoActividad: 'LECTURA',
            estado: 'PENDIENTE',
            medidor: {
              medidorId: 7n,
              serie: 'MED-001',
              latitud: -0.9,
              longitud: -80.7,
            },
            contrato: {
              numeroGuia: 'GUIA-001',
              direccionSuministro: 'Calle 1',
              cliente: {
                nombres: 'Juan',
                apellidos: 'Pérez',
                razonSocial: null,
              },
            },
          },
        ],
      },
    ]);

    const routes = await repository.findRoutesByOperator(10, 20);

    expect(prisma.rutas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { operarioId: 10, periodoId: 20, deletedAt: null },
        include: expect.objectContaining({
          ordenesTrabajo: expect.objectContaining({
            where: { deletedAt: null },
          }),
        }),
      }),
    );
    expect(routes[0].paradas).toEqual([
      {
        ordenTrabajoId: 9n,
        latitud: -0.9,
        longitud: -80.7,
        serie: 'MED-001',
        clienteNombre: 'Juan Pérez',
        tipoActividad: 'LECTURA',
        estado: 'PENDIENTE',
        direccionSuministro: 'Calle 1',
      },
    ]);
  });

  it('updates route state with optimistic locking', async () => {
    prisma.rutas.update.mockResolvedValue({
      rutaId: 1n,
      medidor: null,
      ordenesTrabajo: [],
    });

    await repository.updateRouteState(
      1n,
      { estado: 'EN_PROGRESO' },
      'PENDIENTE',
    );

    expect(prisma.rutas.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          rutaId: 1n,
          deletedAt: null,
          estado: 'PENDIENTE',
        },
        data: { estado: 'EN_PROGRESO' },
      }),
    );
  });

  it('maps Prisma P2025 to a route concurrency error', async () => {
    prisma.rutas.update.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Record not found', {
        code: 'P2025',
        clientVersion: '7.6.0',
      }),
    );

<<<<<<< HEAD
    await expect(
      repository.updateRouteState(1n, { estado: 'EN_PROGRESO' }, 'PENDIENTE'),
    ).rejects.toBeInstanceOf(InvalidDomainOperationException);
=======
        const result = await repository.updateTaskState(BigInt(1), {
          estado: 'EN_PROGRESO',
        });

        expect(prisma.rutas.update).toHaveBeenCalledWith({
          where: { rutaId: BigInt(1), deletedAt: null },
          data: { estado: 'EN_PROGRESO' },
          include: {
            operario: {
              select: { usuarioId: true, nombres: true, apellidos: true },
            },
          },
        });
        expect(result).toEqual(mockUpdated);
      });

      it('should set fechaInicio when transitioning to EN_PROGRESO', async () => {
        const mockUpdated = {
          rutaId: BigInt(1),
          estado: 'EN_PROGRESO',
          fechaInicio: new Date(),
        };
        prisma.rutas.update.mockResolvedValue(mockUpdated);

        await repository.updateTaskState(BigInt(1), {
          estado: 'EN_PROGRESO',
          fechaInicio: new Date(),
        });

        expect(prisma.rutas.update).toHaveBeenCalledWith({
          where: { rutaId: BigInt(1), deletedAt: null },
          data: expect.objectContaining({
            estado: 'EN_PROGRESO',
            fechaInicio: expect.any(Date),
          }),
          include: {
            operario: {
              select: { usuarioId: true, nombres: true, apellidos: true },
            },
          },
        });
      });

      it('should pass expectedEstado in the where for optimistic locking', async () => {
        prisma.rutas.update.mockResolvedValue({ rutaId: BigInt(1) });

        await repository.updateTaskState(
          BigInt(1),
          { estado: 'EN_PROGRESO' },
          'PENDIENTE',
        );

        expect(prisma.rutas.update).toHaveBeenCalledWith({
          where: { rutaId: BigInt(1), deletedAt: null, estado: 'PENDIENTE' },
          data: expect.objectContaining({ estado: 'EN_PROGRESO' }),
          include: {
            operario: {
              select: { usuarioId: true, nombres: true, apellidos: true },
            },
          },
        });
      });

      it('should translate Prisma P2025 to InvalidDomainOperationException', async () => {
        const p2025 = new Prisma.PrismaClientKnownRequestError(
          'Record not found',
          { code: 'P2025', clientVersion: '7.6.0' },
        );
        prisma.rutas.update.mockRejectedValue(p2025);

        await expect(
          repository.updateTaskState(
            BigInt(1),
            { estado: 'EN_PROGRESO' },
            'PENDIENTE',
          ),
        ).rejects.toThrow(InvalidDomainOperationException);
      });

      it('should rethrow non-P2025 errors unchanged', async () => {
        const dbError = new Error('Connection refused');
        prisma.rutas.update.mockRejectedValue(dbError);

        await expect(
          repository.updateTaskState(BigInt(1), { estado: 'EN_PROGRESO' }),
        ).rejects.toThrow('Connection refused');
      });
    });

    describe('findOperatorsByGeography', () => {
      it('should find operators with routes in a given comunidad and sector', async () => {
        const mockOperators = [
          { usuarioId: 1, nombres: 'Juan', apellidos: 'Perez' },
          { usuarioId: 2, nombres: 'Maria', apellidos: 'Lopez' },
        ];
        prisma.usuarios.findMany.mockResolvedValue(mockOperators);

        const result = await repository.findOperatorsByGeography(5, 3);

        expect(prisma.usuarios.findMany).toHaveBeenCalledWith({
          where: {
            rutas: {
              some: {
                comunidadId: 5,
                sectorId: 3,
                deletedAt: null,
              },
            },
          },
        });
        expect(result).toEqual(mockOperators);
      });

      it('should find operators with routes in a comunidad when sector is null', async () => {
        prisma.usuarios.findMany.mockResolvedValue([]);

        const result = await repository.findOperatorsByGeography(5, null);

        expect(prisma.usuarios.findMany).toHaveBeenCalledWith({
          where: {
            rutas: {
              some: {
                comunidadId: 5,
                deletedAt: null,
              },
            },
          },
        });
        expect(result).toEqual([]);
      });
    });

    describe('getMaxOrdenInZona', () => {
      it('should return the max orden for a given comunidad and sector', async () => {
        prisma.rutas.aggregate.mockResolvedValue({ _max: { orden: 5 } });

        const result = await repository.getMaxOrdenInZona(5, 3);

        expect(prisma.rutas.aggregate).toHaveBeenCalledWith({
          where: { comunidadId: 5, sectorId: 3, deletedAt: null },
          _max: { orden: true },
        });
        expect(result).toBe(5);
      });

      it('should return 0 when no tasks exist in the zona', async () => {
        prisma.rutas.aggregate.mockResolvedValue({ _max: { orden: null } });

        const result = await repository.getMaxOrdenInZona(5, 3);

        expect(result).toBe(0);
      });

      it('should handle null sectorId by querying without sector filter', async () => {
        prisma.rutas.aggregate.mockResolvedValue({ _max: { orden: null } });

        await repository.getMaxOrdenInZona(5, null);

        expect(prisma.rutas.aggregate).toHaveBeenCalledWith({
          where: { comunidadId: 5, deletedAt: null },
          _max: { orden: true },
        });
      });
    });

    describe('findMeterContractLocation', () => {
      it('should return contract location for a meter', async () => {
        prisma.medidores.findUnique.mockResolvedValue({
          serie: 'MED-001',
          historial: [{ contrato: { comunidadId: 5, sectorId: 3 } }],
        });

        const result = await repository.findMeterContractLocation(BigInt(100));

        expect(prisma.medidores.findUnique).toHaveBeenCalledWith({
          where: { medidorId: BigInt(100) },
          select: expect.objectContaining({ serie: true }),
        });
        expect(result).toEqual({
          serie: 'MED-001',
          comunidadId: 5,
          sectorId: 3,
        });
      });

      it('should return null when meter does not exist', async () => {
        prisma.medidores.findUnique.mockResolvedValue(null);

        const result = await repository.findMeterContractLocation(BigInt(999));

        expect(result).toBeNull();
      });

      it('should return null sectorId when contract has no sector', async () => {
        prisma.medidores.findUnique.mockResolvedValue({
          serie: 'MED-002',
          historial: [{ contrato: { comunidadId: 7, sectorId: null } }],
        });

        const result = await repository.findMeterContractLocation(BigInt(200));

        expect(result).toEqual({
          serie: 'MED-002',
          comunidadId: 7,
          sectorId: null,
        });
      });
    });
>>>>>>> origin/develop
  });
});
