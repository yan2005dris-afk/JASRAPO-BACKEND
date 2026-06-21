import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { RecalculateRouteOrderUseCase } from './recalculate-route-order.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';

describe('RecalculateRouteOrderUseCase', () => {
  let useCase: RecalculateRouteOrderUseCase;

  const mockPrisma = {
    rutas: {
      findMany: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecalculateRouteOrderUseCase,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    useCase = module.get<RecalculateRouteOrderUseCase>(
      RecalculateRouteOrderUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should recalculate orden for tasks in a zone', async () => {
    mockPrisma.rutas.findMany.mockResolvedValue([
      {
        rutaId: BigInt(1),
        medidor: { latitud: 0, longitud: 0 },
      },
      {
        rutaId: BigInt(2),
        medidor: { latitud: 1, longitud: 0 },
      },
      {
        rutaId: BigInt(3),
        medidor: { latitud: 0, longitud: 1 },
      },
    ]);

    await useCase.execute(5, 3);

    expect(mockPrisma.rutas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          comunidadId: 5,
          sectorId: 3,
          deletedAt: null,
          estado: { notIn: ['CANCELADA', 'COMPLETADA'] },
          medidorId: { not: null },
        },
        include: {
          medidor: {
            select: { latitud: true, longitud: true },
          },
        },
      }),
    );

    // Should update each task with orden
    expect(mockPrisma.rutas.update).toHaveBeenCalledTimes(3);
    expect(mockPrisma.rutas.update).toHaveBeenCalledWith({
      where: { rutaId: BigInt(1) },
      data: { orden: 0 },
    });
    expect(mockPrisma.rutas.update).toHaveBeenCalledWith({
      where: { rutaId: BigInt(2) },
      data: { orden: 1 },
    });
    expect(mockPrisma.rutas.update).toHaveBeenCalledWith({
      where: { rutaId: BigInt(3) },
      data: { orden: 2 },
    });
  });

  it('should handle single task in zone', async () => {
    mockPrisma.rutas.findMany.mockResolvedValue([
      {
        rutaId: BigInt(1),
        medidor: { latitud: -33.45, longitud: -70.66 },
      },
    ]);

    await useCase.execute(5, 3);

    expect(mockPrisma.rutas.update).toHaveBeenCalledTimes(1);
    expect(mockPrisma.rutas.update).toHaveBeenCalledWith({
      where: { rutaId: BigInt(1) },
      data: { orden: 0 },
    });
  });

  it('should handle empty zone gracefully', async () => {
    mockPrisma.rutas.findMany.mockResolvedValue([]);

    await useCase.execute(5, null);

    expect(mockPrisma.rutas.update).not.toHaveBeenCalled();
  });

  it('should handle tasks without medidor coordinates by assigning remaining orden', async () => {
    mockPrisma.rutas.findMany.mockResolvedValue([
      {
        rutaId: BigInt(1),
        medidor: { latitud: null, longitud: null },
      },
      {
        rutaId: BigInt(2),
        medidor: { latitud: 10, longitud: 10 },
      },
    ]);

    await useCase.execute(5, null);

    // tasks without coords get orden without geographic optimization
    expect(mockPrisma.rutas.update).toHaveBeenCalledTimes(2);
  });

  it('should handle null sectorId by querying without sector filter', async () => {
    mockPrisma.rutas.findMany.mockResolvedValue([]);

    await useCase.execute(5, null);

    expect(mockPrisma.rutas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ comunidadId: 5 }),
      }),
    );
    expect(mockPrisma.rutas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.not.objectContaining({ sectorId: undefined }),
      }),
    );
  });
});
