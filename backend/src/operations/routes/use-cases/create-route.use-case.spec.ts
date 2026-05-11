import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { CreateRouteUseCase } from './create-route.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoGenerico } from 'src/generated/prisma/client';
describe('CreateRouteUseCase', () => {
  let useCase: CreateRouteUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      usuarios: { findUnique: jest.fn() },
      comunidades: { findUnique: jest.fn() },
      sectores: { findUnique: jest.fn() },
      lecturas: { findMany: jest.fn(), updateMany: jest.fn() },
      rutas: { create: jest.fn() },
      $transaction: jest.fn((callback) => callback(prismaService)),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateRouteUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<CreateRouteUseCase>(CreateRouteUseCase);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if operario not found', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue(null);
    await expect(
      useCase.execute({ operarioId: 1, lecturaIds: [] } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if operario is not an operator', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'admin' },
    });

    await expect(
      useCase.execute({ operarioId: 1, lecturaIds: [] } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw NotFoundException if comunidad not found', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    prismaService.comunidades.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({ operarioId: 1, comunidadId: 2, lecturaIds: [] } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if sector not found', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    prismaService.sectores.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        sectorId: 2,
        lecturaIds: [],
      } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if sector does not belong to comunidad', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    prismaService.sectores.findUnique.mockResolvedValue({
      sectorId: 2,
      comunidadId: 99,
    });

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        sectorId: 2,
        lecturaIds: [],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if readings are missing or not eligible', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });

    // We send 2 lecturaIds but findMany returns only 1
    prismaService.lecturas.findMany.mockResolvedValue([
      { lecturaId: 10n, contrato: { estado: EstadoGenerico.ACTIVO } },
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        tipoRuta: 'TOMA_LECTURA',
        lecturaIds: ['10', '20'],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException if readings contracts state mismatch', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });

    prismaService.lecturas.findMany.mockResolvedValue([
      { lecturaId: 10n, contrato: { estado: EstadoGenerico.SUSPENDIDO } },
    ]);

    await expect(
      useCase.execute({
        operarioId: 1,
        comunidadId: 1,
        tipoRuta: 'TOMA_LECTURA',
        lecturaIds: ['10'],
      } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('should create route and update lecturas successfully', async () => {
    prismaService.usuarios.findUnique.mockResolvedValue({
      usuarioId: 1,
      rol: { nombre: 'operadores' },
    });
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });

    prismaService.lecturas.findMany.mockResolvedValue([
      { lecturaId: 10n, contrato: { estado: EstadoGenerico.ACTIVO } },
    ]);

    const mockCreatedRoute = {
      rutaId: 100n,
      nombre: 'Test Route',
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
    };
    prismaService.rutas.create.mockResolvedValue(mockCreatedRoute);

    const result = await useCase.execute({
      operarioId: 1,
      comunidadId: 1,
      tipoRuta: 'TOMA_LECTURA',
      lecturaIds: ['10'],
      nombre: 'Test Route',
    } as any);

    expect(prismaService.$transaction).toHaveBeenCalled();
    expect(prismaService.rutas.create).toHaveBeenCalled();
    expect(prismaService.lecturas.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { lecturaId: { in: [10n] } },
        data: { rutaAsignadaId: 100n, estadoAsignacion: 'ASIGNADA' },
      }),
    );
    expect(result.rutaId).toBe(100n);
    expect(result.nombre).toBe('Test Route');
  });
});
