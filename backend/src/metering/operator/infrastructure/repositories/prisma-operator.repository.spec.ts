import { Test } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import { ConflictDomainException } from 'src/shared/domain/exceptions/domain.exception';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PrismaOperatorRepository } from './prisma-operator.repository';

describe('PrismaOperatorRepository routes', () => {
  const prisma = {
    rutas: {
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    ordenesTrabajo: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    operatorSyncChange: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
    $queryRaw: jest.fn(),
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

  it('uses sequence > cursor and limit+1 semantics for scoped changes', async () => {
    prisma.operatorSyncChange.findMany.mockResolvedValue([
      {
        sequenceId: 8n,
        entityType: 'lecturas',
        entityId: 20n,
        operation: 'UPDATE',
        changedAt: new Date(),
        payload: { data: { lecturaId: '20' } },
      },
      {
        sequenceId: 9n,
        entityType: 'medidores',
        entityId: 21n,
        operation: 'DELETE',
        changedAt: new Date(),
        payload: { data: {} },
      },
      {
        sequenceId: 10n,
        entityType: 'rutas',
        entityId: 22n,
        operation: 'CREATE',
        changedAt: new Date(),
        payload: { data: {} },
      },
    ]);

    const result = await repository.findSyncChanges(
      20,
      [{ rutaId: 7n, comunidadId: 3, sectorId: 4 }],
      7n,
      2,
    );

    expect(prisma.operatorSyncChange.findMany).toHaveBeenCalledWith({
      where: expect.objectContaining({
        sequenceId: { gt: 7n },
        OR: expect.arrayContaining([
          { rutaId: 7n, entityType: { in: ['rutas', 'ordenes_trabajo'] } },
          {
            comunidadId: 3,
            sectorId: 4,
            periodoId: 20,
            entityType: { in: ['lecturas'] },
          },
          { comunidadId: 3, sectorId: 4, entityType: { in: ['medidores'] } },
        ]),
      }),
      orderBy: { sequenceId: 'asc' },
      take: 3,
    });
    expect(result.items).toHaveLength(2);
    expect(result.hasMore).toBe(true);
    expect(result.nextSequence).toBe(9n);
  });

  it('does not query or expose changes outside an assigned scope', async () => {
    const result = await repository.findSyncChanges(20, [], 0n, 10);
    expect(result).toEqual({ items: [], hasMore: false, nextSequence: null });
    expect(prisma.operatorSyncChange.findMany).not.toHaveBeenCalled();
  });

  it('uses bounded keyset predicates for sync routes', async () => {
    prisma.rutas.findMany.mockResolvedValue([]);
    prisma.rutas.count.mockResolvedValue(3);
    await repository.findSyncRoutes(
      10,
      20,
      new Date('2026-01-02T00:00:00Z'),
      { updatedAt: new Date('2026-01-01T00:00:00Z'), id: 4n },
      2,
    );
    expect(prisma.rutas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 3,
        orderBy: [{ updatedAt: 'asc' }, { rutaId: 'asc' }],
        where: expect.objectContaining({
          estado: {
            notIn: ['CANCELADA', 'COMPLETADA'],
          },
          updatedAt: expect.objectContaining({
            lte: new Date('2026-01-02T00:00:00Z'),
          }),
          OR: [
            { updatedAt: { gt: new Date('2026-01-01T00:00:00Z') } },
            { updatedAt: new Date('2026-01-01T00:00:00Z'), rutaId: { gt: 4n } },
          ],
        }),
      }),
    );
  });

  it('builds route stops from the work order contract, sourcing meter coordinates from it', async () => {
    prisma.rutas.findMany.mockResolvedValue([
      {
        rutaId: 1n,
        tipoActividad: { codigo: 'LECTURA' },
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
            },
            contrato: {
              numeroGuia: 'GUIA-001',
              direccionSuministro: 'Calle 1',
              latitud: new Prisma.Decimal('-0.9'),
              longitud: new Prisma.Decimal('-80.7'),
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
    expect(routes[0].ordenesTrabajo[0].medidor).toEqual({
      medidorId: 7n,
      serie: 'MED-001',
      latitud: -0.9,
      longitud: -80.7,
    });
    expect(routes[0].ordenesTrabajo[0].contrato).toEqual({
      numeroGuia: 'GUIA-001',
      direccionSuministro: 'Calle 1',
      cliente: { nombres: 'Juan', apellidos: 'Pérez', razonSocial: null },
    });
    expect(typeof routes[0].ordenesTrabajo[0].medidor!.latitud).toBe('number');
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

  it('produces a stop without a serie for a meterless order whose contract has coordinates', async () => {
    prisma.rutas.findMany.mockResolvedValue([
      {
        rutaId: 1n,
        tipoActividad: { codigo: 'INSTALACION' },
        nombre: 'Ruta instalación',
        medidor: null,
        ordenesTrabajo: [
          {
            ordenTrabajoId: 11n,
            rutaId: 1n,
            tipoActividad: 'INSTALACION',
            estado: 'PENDIENTE',
            medidor: null,
            contrato: {
              numeroGuia: 'GUIA-002',
              direccionSuministro: 'Calle 2',
              latitud: new Prisma.Decimal('-1.5'),
              longitud: new Prisma.Decimal('-80.5'),
              cliente: {
                nombres: 'Ana',
                apellidos: 'Gómez',
                razonSocial: null,
              },
            },
          },
        ],
      },
    ]);

    const routes = await repository.findRoutesByOperator(10, 20);

    expect(routes[0].paradas).toEqual([
      {
        ordenTrabajoId: 11n,
        latitud: -1.5,
        longitud: -80.5,
        serie: undefined,
        clienteNombre: 'Ana Gómez',
        tipoActividad: 'INSTALACION',
        estado: 'PENDIENTE',
        direccionSuministro: 'Calle 2',
      },
    ]);
  });

  it('produces no stop when the order contract has no coordinates', async () => {
    prisma.rutas.findMany.mockResolvedValue([
      {
        rutaId: 1n,
        tipoActividad: { codigo: 'LECTURA' },
        nombre: 'Ruta sin coordenadas',
        medidor: null,
        ordenesTrabajo: [
          {
            ordenTrabajoId: 12n,
            rutaId: 1n,
            tipoActividad: 'LECTURA',
            estado: 'PENDIENTE',
            medidor: { medidorId: 8n, serie: 'MED-002' },
            contrato: {
              numeroGuia: 'GUIA-003',
              direccionSuministro: 'Calle 3',
              latitud: null,
              longitud: null,
              cliente: {
                nombres: 'Luis',
                apellidos: 'Ruiz',
                razonSocial: null,
              },
            },
          },
        ],
      },
    ]);

    const routes = await repository.findRoutesByOperator(10, 20);

    expect(routes[0].paradas).toEqual([]);
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

    await expect(
      repository.updateRouteState(1n, { estado: 'EN_PROGRESO' }, 'PENDIENTE'),
    ).rejects.toBeInstanceOf(ConflictDomainException);
  });

  it('selects contract coordinates (not meter coordinates) for the sync work orders manifest', async () => {
    prisma.ordenesTrabajo.findMany.mockResolvedValue([
      {
        ordenTrabajoId: 30n,
        rutaId: 1n,
        updatedAt: new Date('2026-01-01T00:00:00Z'),
        ruta: { tipoActividad: { codigo: 'LECTURA' } },
        medidor: { medidorId: 7n, serie: 'MED-001' },
        contrato: {
          numeroGuia: 'GUIA-010',
          direccionSuministro: 'Calle 10',
          latitud: new Prisma.Decimal('-1.1'),
          longitud: new Prisma.Decimal('-80.1'),
          cliente: { nombres: 'Rosa', apellidos: 'Vera', razonSocial: null },
        },
      },
    ]);
    prisma.ordenesTrabajo.count.mockResolvedValue(1);

    const page = await repository.findSyncWorkOrders(
      10,
      20,
      [1n],
      new Date('2026-01-02T00:00:00Z'),
      null,
      10,
    );

    expect(prisma.ordenesTrabajo.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          contrato: expect.objectContaining({
            select: expect.objectContaining({
              latitud: true,
              longitud: true,
            }),
          }),
          medidor: expect.objectContaining({
            select: expect.not.objectContaining({
              latitud: true,
              longitud: true,
            }),
          }),
        }),
      }),
    );
    const mappedMedidor = (page.items[0] as any).medidor;
    expect(mappedMedidor.latitud).toBe(-1.1);
    expect(mappedMedidor.longitud).toBe(-80.1);
    expect(typeof mappedMedidor.latitud).toBe('number');
    expect((page.items[0] as any).contrato).not.toHaveProperty('latitud');
  });

  it('captures atomic snapshot version and watermark in getSyncSnapshotContext', async () => {
    const date = new Date('2026-01-01T00:00:00.000Z');
    prisma.$queryRaw.mockResolvedValue([
      { snapshot_version: date, watermark: 15n },
    ]);

    const context = await repository.getSyncSnapshotContext();
    expect(context).toEqual({
      snapshotVersion: date,
      watermark: 15n,
    });
  });
});
