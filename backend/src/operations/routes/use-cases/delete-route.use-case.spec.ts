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

  it('should soft delete the route and unassign readings inside the transaction', async () => {
    prismaService.rutas.findUnique.mockResolvedValue({ id: 1n });
    prismaService.rutas.update.mockResolvedValue({ id: 1n });
    prismaService.lecturas.updateMany.mockResolvedValue({ count: 2 });

    await useCase.execute(1n);

    expect(prismaService.$transaction).toHaveBeenCalled();
    expect(prismaService.rutas.update).toHaveBeenCalledWith({
      where: { id: 1n },
      data: expect.objectContaining({
        deletedAt: expect.any(Date),
      }),
    });
    expect(prismaService.lecturas.updateMany).toHaveBeenCalledWith({
      where: { rutaId: 1n },
      data: expect.objectContaining({
        rutaId: null,
      }),
    });
  });
});
