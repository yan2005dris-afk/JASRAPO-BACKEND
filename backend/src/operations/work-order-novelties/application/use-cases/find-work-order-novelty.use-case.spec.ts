import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { FindWorkOrderNoveltyUseCase } from './find-work-order-novelty.use-case';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../../domain/repositories/work-order-novelty.repository';
import { workOrderNoveltyRow } from '../../__test-utils__/work-order-novelty-row.factory';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';

describe('FindWorkOrderNoveltyUseCase', () => {
  let useCase: FindWorkOrderNoveltyUseCase;
  let repoMock: any;

  beforeEach(async () => {
    repoMock = { findById: jest.fn() };
    const module = await Test.createTestingModule({
      providers: [
        FindWorkOrderNoveltyUseCase,
        { provide: WORK_ORDER_NOVELTY_REPOSITORY, useValue: repoMock },
      ],
    }).compile();
    useCase = module.get<FindWorkOrderNoveltyUseCase>(
      FindWorkOrderNoveltyUseCase,
    );
  });

  it('returns the novelty when present', async () => {
    const entity = workOrderNoveltyRow({
      novedadId: 42n,
      ordenTrabajoId: 10n,
      tipo: TipoAnomalia.FUGA,
      estado: EstadoNovedad.OPEN,
    });
    repoMock.findById.mockResolvedValue(entity);

    expect(await useCase.execute(42n)).toBe(entity);
  });

  it('throws NotFoundException when novelty is missing', async () => {
    repoMock.findById.mockResolvedValue(null);
    await expect(useCase.execute(999n)).rejects.toThrow(NotFoundException);
  });
});
