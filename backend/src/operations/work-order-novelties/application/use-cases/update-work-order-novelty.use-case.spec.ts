import { Test } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UpdateWorkOrderNoveltyUseCase } from './update-work-order-novelty.use-case';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { FindWorkOrderNoveltyUseCase } from './find-work-order-novelty.use-case';
import { workOrderNoveltyRow } from '../../__test-utils__/work-order-novelty-row.factory';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';

describe('UpdateWorkOrderNoveltyUseCase', () => {
  let useCase: UpdateWorkOrderNoveltyUseCase;
  let repoMock: any;
  let findUseCaseMock: any;

  beforeEach(async () => {
    repoMock = { update: jest.fn() };
    findUseCaseMock = { execute: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        UpdateWorkOrderNoveltyUseCase,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
        { provide: FindWorkOrderNoveltyUseCase, useValue: findUseCaseMock },
        {
          provide: StorageService,
          useValue: { upload: jest.fn(), delete: jest.fn() },
        },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();
    useCase = module.get<UpdateWorkOrderNoveltyUseCase>(
      UpdateWorkOrderNoveltyUseCase,
    );
  });

  it('rejects reassignment of ordenTrabajoId', async () => {
    findUseCaseMock.execute.mockResolvedValue(
      workOrderNoveltyRow({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.OPEN,
      }),
    );
    await expect(
      useCase.execute(1n, { ordenTrabajoId: '20' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('validates state transitions and stamps resolution metadata when RESOLVED', async () => {
    const existing = workOrderNoveltyRow({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      estado: EstadoNovedad.OPEN,
    });
    findUseCaseMock.execute.mockResolvedValue(existing);
    repoMock.update.mockResolvedValue(
      workOrderNoveltyRow({
        ...existing,
        estado: EstadoNovedad.RESOLVED,
      }),
    );

    await useCase.execute(
      1n,
      { estado: EstadoNovedad.RESOLVED },
      undefined,
      42,
    );
    expect(repoMock.update).toHaveBeenCalledWith(
      1n,
      expect.objectContaining({
        estado: EstadoNovedad.RESOLVED,
        resueltoPorUsuarioId: 42,
        resueltoEn: expect.any(Date),
      }),
    );

    findUseCaseMock.execute.mockResolvedValue(
      workOrderNoveltyRow({
        novedadId: 1n,
        ordenTrabajoId: 10n,
        estado: EstadoNovedad.RESOLVED,
      }),
    );
    await expect(
      useCase.execute(1n, { estado: EstadoNovedad.OPEN }),
    ).rejects.toThrow(BadRequestException);
  });
});
