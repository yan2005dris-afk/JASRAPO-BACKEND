import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderNoveltyService } from './work-order-novelty.service';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';

describe('WorkOrderNoveltyService', () => {
  let service: WorkOrderNoveltyService;
  let repoMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    repoMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findByWorkOrderId: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    };
    prismaMock = { ordenesTrabajo: { findUnique: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [
        WorkOrderNoveltyService,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
        { provide: PrismaService, useValue: prismaMock },
        {
          provide: StorageService,
          useValue: { uploadFile: jest.fn(), deleteFile: jest.fn() },
        },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();
    service = module.get<WorkOrderNoveltyService>(WorkOrderNoveltyService);
  });

  it('creates novelty with valid order and optional same-order reading context', async () => {
    prismaMock.ordenesTrabajo.findUnique.mockResolvedValue({
      ordenTrabajoId: 10n,
      lecturaId: 50n,
    });
    const expected = new WorkOrderNoveltyEntity({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      lecturaId: 50n,
      tipo: TipoAnomalia.FUGA,
      estado: EstadoNovedad.OPEN,
    });
    repoMock.create.mockResolvedValue(expected);

    const res = await service.create({
      ordenTrabajoId: '10',
      lecturaId: '50',
      tipo: TipoAnomalia.FUGA,
    });
    expect(res).toBe(expected);
    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ ordenTrabajoId: 10n, lecturaId: 50n }),
    );
  });

  it('rejects creation if work order is missing or reading context belongs to another order', async () => {
    prismaMock.ordenesTrabajo.findUnique.mockResolvedValueOnce(null);
    await expect(
      service.create({ ordenTrabajoId: '999', tipo: TipoAnomalia.FUGA }),
    ).rejects.toThrow(NotFoundException);

    prismaMock.ordenesTrabajo.findUnique.mockResolvedValueOnce({
      ordenTrabajoId: 10n,
      lecturaId: 50n,
    });
    await expect(
      service.create({
        ordenTrabajoId: '10',
        lecturaId: '99',
        tipo: TipoAnomalia.FUGA,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('rejects reassignment of ordenTrabajoId', async () => {
    repoMock.findById.mockResolvedValue(
      new WorkOrderNoveltyEntity({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.OPEN,
      }),
    );
    await expect(
      service.update(1n, { ordenTrabajoId: '20' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('validates state transitions and stamps resolution metadata when RESOLVED', async () => {
    const existing = new WorkOrderNoveltyEntity({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      estado: EstadoNovedad.OPEN,
    });
    repoMock.findById.mockResolvedValue(existing);
    repoMock.update.mockResolvedValue(
      new WorkOrderNoveltyEntity({
        ...existing,
        estado: EstadoNovedad.RESOLVED,
      }),
    );

    await service.update(1n, { estado: EstadoNovedad.RESOLVED }, undefined, 42);
    expect(repoMock.update).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({
        estado: EstadoNovedad.RESOLVED,
        resueltoPorUsuarioId: 42,
        resueltoEn: expect.any(Date),
      }),
    );

    repoMock.findById.mockResolvedValue(
      new WorkOrderNoveltyEntity({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.RESOLVED,
      }),
    );
    await expect(
      service.update(1n, { estado: EstadoNovedad.OPEN }),
    ).rejects.toThrow(BadRequestException);
  });
});
