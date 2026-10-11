import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateWorkOrderNoveltyUseCase } from './create-work-order-novelty.use-case';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';
import { OrdenTrabajoRepository } from 'src/operations/work-orders/domain/repositories/orden-trabajo.repository';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { TipoAnomalia } from 'src/shared/enums';
import { workOrderNoveltyRow } from '../../__test-utils__/work-order-novelty-row.factory';
import * as evidenceUpload from 'src/infrastructure/storage/evidence-upload.util';
import { SRI_STORAGE_TYPES } from 'src/infrastructure/storage/storage.service';

describe('CreateWorkOrderNoveltyUseCase', () => {
  let useCase: CreateWorkOrderNoveltyUseCase;
  let repoMock: any;
  let ordenTrabajoRepoMock: any;
  let storageMock: { upload: jest.Mock; delete: jest.Mock };

  beforeEach(async () => {
    repoMock = { create: jest.fn() };
    ordenTrabajoRepoMock = { findById: jest.fn() };
    storageMock = { upload: jest.fn(), delete: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        CreateWorkOrderNoveltyUseCase,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
        { provide: OrdenTrabajoRepository, useValue: ordenTrabajoRepoMock },
        {
          provide: StorageService,
          useValue: storageMock,
        },
        {
          provide: LoggerService,
          useValue: { log: jest.fn(), warn: jest.fn(), error: jest.fn() },
        },
      ],
    }).compile();
    useCase = module.get<CreateWorkOrderNoveltyUseCase>(
      CreateWorkOrderNoveltyUseCase,
    );
  });

  afterEach(() => jest.restoreAllMocks());

  it('creates novelty with valid order and optional same-order reading context', async () => {
    ordenTrabajoRepoMock.findById.mockResolvedValue({
      ordenTrabajoId: 10n,
      lecturaId: 50n,
    });
    const expected = workOrderNoveltyRow({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      lecturaId: 50n,
      tipo: TipoAnomalia.FUGA,
      estado: 'OPEN',
    });
    repoMock.create.mockResolvedValue(expected);

    const res = await useCase.execute({
      ordenTrabajoId: '10',
      lecturaId: '50',
      tipo: TipoAnomalia.FUGA,
    });
    expect(res).toBe(expected);
    expect(repoMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ ordenTrabajoId: 10n, lecturaId: 50n }),
    );
  });

  it('rejects creation if work order is missing', async () => {
    ordenTrabajoRepoMock.findById.mockResolvedValueOnce(null);
    await expect(
      useCase.execute({ ordenTrabajoId: '999', tipo: TipoAnomalia.FUGA }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects creation if reading context belongs to another order', async () => {
    ordenTrabajoRepoMock.findById.mockResolvedValueOnce({
      ordenTrabajoId: 10n,
      lecturaId: 50n,
    });
    await expect(
      useCase.execute({
        ordenTrabajoId: '10',
        lecturaId: '99',
        tipo: TipoAnomalia.FUGA,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('elimina la evidencia subida si falla la persistencia de la novedad', async () => {
    ordenTrabajoRepoMock.findById.mockResolvedValue({
      ordenTrabajoId: 10n,
      lecturaId: null,
    });
    jest
      .spyOn(evidenceUpload, 'uploadEvidence')
      .mockResolvedValue('work-order-novelties/photo.webp');
    const dbError = new Error('database unavailable');
    repoMock.create.mockRejectedValue(dbError);
    const file = { buffer: Buffer.from('photo') } as Express.Multer.File;

    await expect(
      useCase.execute({ ordenTrabajoId: '10', tipo: TipoAnomalia.FUGA }, file),
    ).rejects.toBe(dbError);

    expect(storageMock.delete).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READING_NEWS,
      'work-order-novelties/photo.webp',
    );
  });
});
