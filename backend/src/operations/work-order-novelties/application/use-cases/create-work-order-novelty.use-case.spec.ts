import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateWorkOrderNoveltyUseCase } from './create-work-order-novelty.use-case';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { StorageService } from 'src/infrastructure/storage/storage.service';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { TipoAnomalia } from 'src/shared/enums';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';

describe('CreateWorkOrderNoveltyUseCase', () => {
  let useCase: CreateWorkOrderNoveltyUseCase;
  let repoMock: any;
  let prismaMock: any;

  beforeEach(async () => {
    repoMock = { create: jest.fn() };
    prismaMock = { ordenesTrabajo: { findUnique: jest.fn() } };
    const module = await Test.createTestingModule({
      providers: [
        CreateWorkOrderNoveltyUseCase,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
        { provide: PrismaService, useValue: prismaMock },
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
    useCase = module.get<CreateWorkOrderNoveltyUseCase>(
      CreateWorkOrderNoveltyUseCase,
    );
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
    prismaMock.ordenesTrabajo.findUnique.mockResolvedValueOnce(null);
    await expect(
      useCase.execute({ ordenTrabajoId: '999', tipo: TipoAnomalia.FUGA }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects creation if reading context belongs to another order', async () => {
    prismaMock.ordenesTrabajo.findUnique.mockResolvedValueOnce({
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
});
