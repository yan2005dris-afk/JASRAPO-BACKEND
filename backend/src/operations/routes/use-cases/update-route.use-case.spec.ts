import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { UpdateRouteUseCase } from './update-route.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('UpdateRouteUseCase', () => {
  let useCase: UpdateRouteUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      rutas: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateRouteUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<UpdateRouteUseCase>(UpdateRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if route not found', async () => {
    prismaService.rutas.findUnique.mockResolvedValue(null);
    await expect(useCase.execute(1n, {} as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update route successfully with defined fields', async () => {
    prismaService.rutas.findUnique.mockResolvedValue({ rutaId: 1n });
    prismaService.rutas.update.mockResolvedValue({ rutaId: 1n, nombre: 'New Name' });

    await useCase.execute(1n, { nombre: 'New Name', descripcion: 'New Desc' });

    expect(prismaService.rutas.update).toHaveBeenCalledWith({
      where: { rutaId: 1n },
      data: {
        nombre: 'New Name',
        descripcion: 'New Desc',
      },
    });
  });

  it('should pass correct data when fechaPlanificada is set to null vs undefined', async () => {
    prismaService.rutas.findUnique.mockResolvedValue({ rutaId: 1n });
    prismaService.rutas.update.mockResolvedValue({ rutaId: 1n });

    await useCase.execute(1n, { fechaPlanificada: null, nombre: undefined } as any);

    expect(prismaService.rutas.update).toHaveBeenCalledWith({
      where: { rutaId: 1n },
      data: {
        fechaPlanificada: null,
      },
    });
  });
});
