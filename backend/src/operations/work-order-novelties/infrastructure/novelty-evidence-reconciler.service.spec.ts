import { NoveltyEvidenceReconcilerService } from './novelty-evidence-reconciler.service';
import { WORK_ORDER_NOVELTY_REPOSITORY } from '../domain/repositories/work-order-novelty.repository';
import {
  SRI_STORAGE_TYPES,
  StorageService,
} from 'src/infrastructure/storage/storage.service';
import { WorkOrderNoveltyEntity } from '../domain/entities/work-order-novelty.entity';
import { EstadoNovedad, TipoAnomalia } from 'src/shared/enums';

describe('NoveltyEvidenceReconcilerService', () => {
  let service: NoveltyEvidenceReconcilerService;
  let repoMock: any;
  let storageMock: any;

  beforeEach(() => {
    repoMock = {
      findSoftDeletedWithEvidence: jest.fn(),
      clearEvidenceReference: jest.fn(),
    };
    storageMock = { delete: jest.fn() };
    service = new NoveltyEvidenceReconcilerService(repoMock, storageMock);
  });

  it('returns zeros when there are no candidates', async () => {
    repoMock.findSoftDeletedWithEvidence.mockResolvedValue([]);
    const result = await service.reconcile();
    expect(result).toEqual({ inspected: 0, cleared: 0, failed: 0 });
    expect(storageMock.delete).not.toHaveBeenCalled();
  });

  it('clears the dangling reference after a successful storage delete', async () => {
    const novelty = new WorkOrderNoveltyEntity({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      tipo: TipoAnomalia.FUGA,
      estado: EstadoNovedad.OPEN,
      deletedAt: new Date('2026-09-01'),
      fotoUrl: 'work-order-novelties/orphan.webp',
    });
    repoMock.findSoftDeletedWithEvidence.mockResolvedValue([novelty]);
    storageMock.delete.mockResolvedValue(undefined);
    repoMock.clearEvidenceReference.mockResolvedValue(undefined);

    const result = await service.reconcile();

    expect(storageMock.delete).toHaveBeenCalledWith(
      SRI_STORAGE_TYPES.READING_NEWS,
      'work-order-novelties/orphan.webp',
    );
    expect(repoMock.clearEvidenceReference).toHaveBeenCalledWith(1n);
    expect(result).toEqual({ inspected: 1, cleared: 1, failed: 0 });
  });

  it('counts failures without aborting the batch', async () => {
    const noveltyA = new WorkOrderNoveltyEntity({
      novedadId: 1n,
      ordenTrabajoId: 10n,
      tipo: TipoAnomalia.FUGA,
      estado: EstadoNovedad.OPEN,
      deletedAt: new Date('2026-09-01'),
      fotoUrl: 'work-order-novelties/a.webp',
    });
    const noveltyB = new WorkOrderNoveltyEntity({
      novedadId: 2n,
      ordenTrabajoId: 10n,
      tipo: TipoAnomalia.OTRO,
      estado: EstadoNovedad.RESOLVED,
      deletedAt: new Date('2026-09-02'),
      fotoUrl: 'work-order-novelties/b.webp',
    });
    repoMock.findSoftDeletedWithEvidence.mockResolvedValue([
      noveltyA,
      noveltyB,
    ]);
    storageMock.delete
      .mockRejectedValueOnce(new Error('storage offline'))
      .mockResolvedValueOnce(undefined);
    repoMock.clearEvidenceReference.mockResolvedValue(undefined);

    const result = await service.reconcile();

    expect(result).toEqual({ inspected: 2, cleared: 1, failed: 1 });
    expect(repoMock.clearEvidenceReference).toHaveBeenCalledTimes(1);
    expect(repoMock.clearEvidenceReference).toHaveBeenCalledWith(2n);
  });

  it('returns zeros and does not crash when the repository throws', async () => {
    repoMock.findSoftDeletedWithEvidence.mockRejectedValue(
      new Error('database unavailable'),
    );

    const result = await service.reconcile();

    expect(result).toEqual({ inspected: 0, cleared: 0, failed: 0 });
    expect(storageMock.delete).not.toHaveBeenCalled();
  });
});
