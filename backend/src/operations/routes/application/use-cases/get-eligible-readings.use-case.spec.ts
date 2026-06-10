import type { TestingModule } from '@nestjs/testing';
import { Test } from '@nestjs/testing';
import { GetEligibleReadingsUseCase } from './get-eligible-readings.use-case';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EstadoGenerico } from 'src/generated/prisma/client';
describe('GetEligibleReadingsUseCase', () => {
  let useCase: GetEligibleReadingsUseCase;
  let prismaService: any;

  beforeEach(async () => {
    prismaService = {
      comunidades: { findUnique: jest.fn() },
      sectores: { findUnique: jest.fn() },
      lecturas: { count: jest.fn(), findMany: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetEligibleReadingsUseCase,
        {
          provide: PrismaService,
          useValue: prismaService,
        },
      ],
    }).compile();

    useCase = module.get<GetEligibleReadingsUseCase>(
      GetEligibleReadingsUseCase,
    );
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should throw NotFoundException if comunidad not found', async () => {
    prismaService.comunidades.findUnique.mockResolvedValue(null);
    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if sector not found', async () => {
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    prismaService.sectores.findUnique.mockResolvedValue(null);

    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        sectorId: 2,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if sector does not belong to comunidad', async () => {
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    prismaService.sectores.findUnique.mockResolvedValue({
      sectorId: 2,
      comunidadId: 99,
    });

    await expect(
      useCase.execute({
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: 1,
        sectorId: 2,
        pagination: { page: 1, limit: 10 },
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('should build correct where clause for TOMA_LECTURA and return paginated mapped data', async () => {
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    prismaService.lecturas.count.mockResolvedValue(1);

    const mockLectura = {
      lecturaId: 10n,
      medidor: {
        historial: [
          {
            fechaHasta: null,
            contrato: {
              estado: 'ACTIVO',
              numeroGuia: 'G-123',
              direccionSuministro: 'Dir 1',
              cliente: { nombres: 'Juan', apellidos: 'Perez' },
              sector: { nombre: 'Sector 1' },
            },
          },
        ],
      },
    };
    prismaService.lecturas.findMany.mockResolvedValue([mockLectura]);

    const result = await useCase.execute({
      tipoRuta: 'TOMA_LECTURA',
      comunidadId: 1,
      pagination: { page: 2, limit: 15 },
      search: ' Juan ',
    });

    expect(prismaService.lecturas.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          estadoAsignacion: 'NO_ASIGNADA',
          medidor: expect.objectContaining({
            historial: expect.objectContaining({
              some: expect.objectContaining({
                contrato: expect.objectContaining({
                  estado: EstadoGenerico.ACTIVO,
                  comunidadId: 1,
                }),
              }),
            }),
          }),
          OR: expect.arrayContaining([
            expect.objectContaining({
              medidor: expect.objectContaining({
                historial: expect.objectContaining({
                  some: expect.objectContaining({
                    contrato: expect.objectContaining({
                      cliente: expect.objectContaining({
                        nombres: expect.objectContaining({ contains: 'Juan' }),
                      }),
                    }),
                  }),
                }),
              }),
            }),
          ]),
        }),
      }),
    );

    expect(prismaService.lecturas.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 15,
        take: 15,
      }),
    );

    expect(result.meta.total).toBe(1);
    expect(result.data).toHaveLength(1);
    expect(result.data[0].lecturaId).toBe(10n);
    expect(result.data[0].clienteNombre).toBe('Juan Perez');
  });

  it('should build correct where clause for RECONEXION type', async () => {
    prismaService.comunidades.findUnique.mockResolvedValue({ comunidadId: 1 });
    prismaService.lecturas.count.mockResolvedValue(0);
    prismaService.lecturas.findMany.mockResolvedValue([]);

    await useCase.execute({
      tipoRuta: 'RECONEXION',
      comunidadId: 1,
      pagination: { page: 1, limit: 10 },
    });

    expect(prismaService.lecturas.count).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          medidor: expect.objectContaining({
            historial: expect.objectContaining({
              some: expect.objectContaining({
                contrato: expect.objectContaining({
                  estado: EstadoGenerico.RECONEXION,
                }),
              }),
            }),
          }),
        }),
      }),
    );
  });
});
