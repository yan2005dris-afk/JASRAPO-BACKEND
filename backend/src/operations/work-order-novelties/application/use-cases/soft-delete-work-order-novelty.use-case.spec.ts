import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { SoftDeleteWorkOrderNoveltyUseCase } from './soft-delete-work-order-novelty.use-case';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { NoveltyEvidenceQueueService } from '../../infrastructure/novelty-evidence-queue.service';
import { FindWorkOrderNoveltyUseCase } from './find-work-order-novelty.use-case';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';

describe('SoftDeleteWorkOrderNoveltyUseCase', () => {
  let useCase: SoftDeleteWorkOrderNoveltyUseCase;
  let repoMock: any;
  let findUseCaseMock: any;
  let evidenceQueueMock: any;
  let loggerMock: any;

  beforeEach(async () => {
    repoMock = { softDelete: jest.fn() };
    findUseCaseMock = { execute: jest.fn() };
    evidenceQueueMock = {
      enqueueCleanup: jest.fn().mockResolvedValue(undefined),
    };
    loggerMock = {
      log: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        SoftDeleteWorkOrderNoveltyUseCase,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
        { provide: FindWorkOrderNoveltyUseCase, useValue: findUseCaseMock },
        { provide: NoveltyEvidenceQueueService, useValue: evidenceQueueMock },
        { provide: LoggerService, useValue: loggerMock },
      ],
    }).compile();
    useCase = module.get<SoftDeleteWorkOrderNoveltyUseCase>(
      SoftDeleteWorkOrderNoveltyUseCase,
    );
  });

  it('soft deletes and enqueues an evidence cleanup job', async () => {
    const existing = new WorkOrderNoveltyEntity({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      estado: EstadoNovedad.OPEN,
      fotoUrl: 'work-order-novelties/evidence.webp',
    });
    findUseCaseMock.execute.mockResolvedValue(existing);
    repoMock.softDelete.mockResolvedValue(
      new WorkOrderNoveltyEntity({
        ...existing,
        deletedAt: new Date(),
      }),
    );

    const res = await useCase.execute(1n, 42);

    expect(res.deletedAt).toBeInstanceOf(Date);
    expect(evidenceQueueMock.enqueueCleanup).toHaveBeenCalledWith(
      1n,
      'work-order-novelties/evidence.webp',
    );
  });

  it('does not enqueue when the novelty has no fotoUrl', async () => {
    const existing = new WorkOrderNoveltyEntity({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      estado: EstadoNovedad.OPEN,
      fotoUrl: null,
    });
    findUseCaseMock.execute.mockResolvedValue(existing);
    repoMock.softDelete.mockResolvedValue(
      new WorkOrderNoveltyEntity({
        ...existing,
        deletedAt: new Date(),
      }),
    );

    await useCase.execute(1n, 42);
    expect(evidenceQueueMock.enqueueCleanup).not.toHaveBeenCalled();
  });

  it('soft delete succeeds even when enqueue throws', async () => {
    const existing = new WorkOrderNoveltyEntity({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      estado: EstadoNovedad.OPEN,
      fotoUrl: 'work-order-novelties/evidence.webp',
    });
    findUseCaseMock.execute.mockResolvedValue(existing);
    repoMock.softDelete.mockResolvedValue(
      new WorkOrderNoveltyEntity({
        ...existing,
        deletedAt: new Date(),
      }),
    );
    evidenceQueueMock.enqueueCleanup.mockRejectedValue(
      new Error('pg-boss down'),
    );

    const res = await useCase.execute(1n, 42);
    expect(res.deletedAt).toBeInstanceOf(Date);
    expect(loggerMock.warn).toHaveBeenCalledWith(
      expect.stringContaining('enqueue_failed'),
    );
  });

  it('throws when the find use case reports the novelty as missing', async () => {
    findUseCaseMock.execute.mockRejectedValue(
      new NotFoundException(`Novedad con ID 999 no encontrada`),
    );
    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
    expect(repoMock.softDelete).not.toHaveBeenCalled();
  });

  it('throws when the novelty is already deleted', async () => {
    findUseCaseMock.execute.mockResolvedValue(
      new WorkOrderNoveltyEntity({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.OPEN,
        deletedAt: new Date(),
      }),
    );
    await expect(useCase.execute(1n)).rejects.toThrow(NotFoundException);
    expect(repoMock.softDelete).not.toHaveBeenCalled();
  });
});
