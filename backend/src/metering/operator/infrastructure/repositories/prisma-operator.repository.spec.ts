import { Test } from '@nestjs/testing';
import { Prisma } from 'src/generated/prisma/client';
import { ConflictDomainException } from 'src/shared/domain/exceptions/domain.exception';
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

    await expect(
      repository.updateRouteState(1n, { estado: 'EN_PROGRESO' }, 'PENDIENTE'),
    ).rejects.toBeInstanceOf(ConflictDomainException);
  });
});
