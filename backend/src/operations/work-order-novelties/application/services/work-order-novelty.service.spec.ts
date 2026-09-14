import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { WorkOrderNoveltyService } from './work-order-novelty.service';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { NoveltyEvidenceQueueService } from '../../infrastructure/novelty-evidence-queue.service';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';

describe('WorkOrderNoveltyService', () => {
  let service: WorkOrderNoveltyService;
  let repoMock: any;
  let prismaMock: any;
  let storageMock: any;
  let loggerMock: any;
  let evidenceQueueMock: any;

  beforeEach(async () => {
    repoMock = {
      create: jest.fn(),
      findById: jest.fn(),
      findByWorkOrderId: jest.fn(),
      update: jest.fn(),
      softDelete: jest.fn(),
      clearEvidenceReference: jest.fn(),
      findMany: jest.fn(),
    };
    prismaMock = { ordenesTrabajo: { findUnique: jest.fn() } };
    storageMock = {
      upload: jest.fn(),
      delete: jest.fn(),
    };
    loggerMock = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
    evidenceQueueMock = {
      enqueueCleanup: jest.fn().mockResolvedValue(undefined),
    };
    const module = await Test.createTestingModule({
      providers: [
        WorkOrderNoveltyService,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
        { provide: PrismaService, useValue: prismaMock },
        { provide: StorageService, useValue: storageMock },
        { provide: LoggerService, useValue: loggerMock },
        { provide: NoveltyEvidenceQueueService, useValue: evidenceQueueMock },
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

  describe('softDelete', () => {
    it('soft deletes and enqueues an evidence cleanup job', async () => {
      const existing = new WorkOrderNoveltyEntity({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.OPEN,
        fotoUrl: 'work-order-novelties/evidence.webp',
      });
      repoMock.findById.mockResolvedValue(existing);
      repoMock.softDelete.mockResolvedValue(
        new WorkOrderNoveltyEntity({
          ...existing,
          deletedAt: new Date(),
        }),
      );

      const res = await service.softDelete(1n, 42);

      expect(res.deletedAt).toBeInstanceOf(Date);
      expect(evidenceQueueMock.enqueueCleanup).toHaveBeenCalledWith(
        1n,
        'work-order-novelties/evidence.webp',
      );
      expect(storageMock.delete).not.toHaveBeenCalled();
    });

    it('does not enqueue when the novelty has no fotoUrl', async () => {
      const existing = new WorkOrderNoveltyEntity({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.OPEN,
        fotoUrl: null,
      });
      repoMock.findById.mockResolvedValue(existing);
      repoMock.softDelete.mockResolvedValue(
        new WorkOrderNoveltyEntity({
          ...existing,
          deletedAt: new Date(),
        }),
      );

      await service.softDelete(1n, 42);
      expect(evidenceQueueMock.enqueueCleanup).not.toHaveBeenCalled();
    });

    it('soft delete succeeds even when enqueue throws (reconciler will catch it)', async () => {
      const existing = new WorkOrderNoveltyEntity({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.OPEN,
        fotoUrl: 'work-order-novelties/evidence.webp',
      });
      repoMock.findById.mockResolvedValue(existing);
      repoMock.softDelete.mockResolvedValue(
        new WorkOrderNoveltyEntity({
          ...existing,
          deletedAt: new Date(),
        }),
      );
      evidenceQueueMock.enqueueCleanup.mockRejectedValue(
        new Error('pg-boss down'),
      );

      const res = await service.softDelete(1n, 42);
      expect(res.deletedAt).toBeInstanceOf(Date);
      expect(loggerMock.warn).toHaveBeenCalledWith(
        expect.stringContaining('enqueue_failed'),
      );
    });

    it('throws when novelty is missing or already deleted', async () => {
      repoMock.findById.mockResolvedValue(null);
      await expect(service.softDelete(999n)).rejects.toThrow(NotFoundException);

      repoMock.findById.mockResolvedValue(
        new WorkOrderNoveltyEntity({
          novedadId: 1n,
          ordenTrabajoId: 10n,
          estado: EstadoNovedad.OPEN,
          deletedAt: new Date(),
        }),
      );
      await expect(service.softDelete(1n)).rejects.toThrow(NotFoundException);
      expect(repoMock.softDelete).not.toHaveBeenCalled();
    });
  });
});
