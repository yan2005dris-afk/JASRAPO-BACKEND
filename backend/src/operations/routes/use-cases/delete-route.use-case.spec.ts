import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { DeleteRouteUseCase } from './delete-route.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('DeleteRouteUseCase', () => {
  let useCase: DeleteRouteUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      rutas: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      lecturas: {
        updateMany: jest.fn(),
      },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteRouteUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<DeleteRouteUseCase>(DeleteRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if route not found', async () => {
    prismaService.rutas.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(1n)).rejects.toThrow(NotFoundException);
  });

  it('should soft delete route and unassign readings', async () => {
    prismaService.rutas.findUnique.mockResolvedValue({ rutaId: 1n });
    prismaService.rutas.update.mockResolvedValue({ rutaId: 1n });
    prismaService.lecturas.updateMany.mockResolvedValue({ count: 5 });

    const result = await useCase.execute(1n);

    expect(prismaService.$transaction).toHaveBeenCalled();
    expect(prismaService.rutas.update).toHaveBeenCalledWith({
      where: { rutaId: 1n },
      data: { deletedAt: expect.any(Date) },
    });
    expect(prismaService.lecturas.updateMany).toHaveBeenCalledWith({
      where: { rutaAsignadaId: 1n },
      data: {
        rutaAsignadaId: null,
        estadoAsignacion: 'NO_ASIGNADA',
      },
    });
    expect(result.message).toBe('Ruta eliminada correctamente');
  });
});
