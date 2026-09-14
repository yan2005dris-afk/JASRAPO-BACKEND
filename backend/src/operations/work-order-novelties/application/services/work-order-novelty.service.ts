import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
  type WorkOrderNoveltyFilters,
} from '../../domain/repositories/work-order-novelty.repository';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';
import { NoveltyLifecyclePolicy } from '../../domain/policies/novelty-lifecycle.policy';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import { uploadEvidence } from 'src/infrastructure/common/utils/evidence-upload.util';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { NoveltyEvidenceQueueService } from '../../infrastructure/novelty-evidence-queue.service';
import {
  EstadoNovedad,
  TipoAnomalia,
  ResolucionEconomicaAnomalia,
} from 'src/shared/enums';

export interface CreateWorkOrderNoveltyDtoInput {
  ordenTrabajoId: string;
  lecturaId?: string | null;
  observacion?: string | null;
  tipo: TipoAnomalia;
  fotoUrl?: string | null;
}

export interface UpdateWorkOrderNoveltyDtoInput {
  ordenTrabajoId?: string;
  observacion?: string | null;
  tipo?: TipoAnomalia;
  estado?: EstadoNovedad;
  fotoUrl?: string | null;
  resolucionTipo?: ResolucionEconomicaAnomalia | null;
  consumoAjustado?: number | null;
  observacionResolucion?: string | null;
}

@Injectable()
export class WorkOrderNoveltyService {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly logger: LoggerService,
    private readonly evidenceQueue: NoveltyEvidenceQueueService,
  ) {}

  async create(
    dto: CreateWorkOrderNoveltyDtoInput,
    file?: Express.Multer.File,
  ): Promise<WorkOrderNoveltyEntity> {
    const ordenTrabajoId = BigInt(dto.ordenTrabajoId);
    const order = await this.prisma.ordenesTrabajo.findUnique({
      where: { ordenTrabajoId },
      select: { ordenTrabajoId: true, lecturaId: true },
    });

    if (!order) {
      throw new NotFoundException(
        `Orden de trabajo con ID ${dto.ordenTrabajoId} no encontrada`,
      );
    }

    let lecturaId: bigint | null = null;
    if (dto.lecturaId) {
      lecturaId = BigInt(dto.lecturaId);
      if (order.lecturaId === null || order.lecturaId !== lecturaId) {
        throw new BadRequestException(
          `La lectura ${dto.lecturaId} no pertenece a la orden de trabajo ${dto.ordenTrabajoId}`,
        );
      }
    }

    let fotoUrl = dto.fotoUrl ?? null;
    if (file) {
      fotoUrl = await uploadEvidence(
        file,
        this.storageService,
        SRI_STORAGE_TYPES.READING_NEWS,
        'work-order-novelties',
        this.logger,
      );
    }

    return this.repository.create({
      ordenTrabajoId,
      lecturaId,
      observacion: dto.observacion ?? null,
      tipo: dto.tipo,
      fotoUrl,
    });
  }

  async findById(id: bigint): Promise<WorkOrderNoveltyEntity> {
    const novelty = await this.repository.findById(id);
    if (!novelty) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }
    return novelty;
  }

  async findAll(filters: WorkOrderNoveltyFilters) {
    return this.repository.findMany(filters);
  }

  async update(
    id: bigint,
    dto: UpdateWorkOrderNoveltyDtoInput,
    file?: Express.Multer.File,
    actorUserId?: number,
  ): Promise<WorkOrderNoveltyEntity> {
    const existing = await this.findById(id);

    if (
      dto.ordenTrabajoId &&
      BigInt(dto.ordenTrabajoId) !== existing.ordenTrabajoId
    ) {
      throw new BadRequestException(
        'ordenTrabajoId es inmutable y no puede reasignarse',
      );
    }

    let resueltoPorUsuarioId = existing.resueltoPorUsuarioId;
    let resueltoEn = existing.resueltoEn;

    if (dto.estado && dto.estado !== existing.estado) {
      NoveltyLifecyclePolicy.assertCanTransition(existing.estado, dto.estado);
      if (dto.estado === EstadoNovedad.RESOLVED) {
        resueltoPorUsuarioId = actorUserId ?? existing.resueltoPorUsuarioId;
        resueltoEn = new Date();
      }
    }

    let fotoUrl = dto.fotoUrl ?? existing.fotoUrl;
    if (file) {
      fotoUrl = await uploadEvidence(
        file,
        this.storageService,
        SRI_STORAGE_TYPES.READING_NEWS,
        'work-order-novelties',
        this.logger,
      );
    }

    return this.repository.update(id, {
      ...dto,
      fotoUrl,
      resueltoPorUsuarioId,
      resueltoEn,
    });
  }

  /**
   * Soft-deletes a novelty and enqueues an evidence cleanup job.
   *
   * Sequence: DB soft-delete FIRST, then enqueue pg-boss job for the storage
   * delete. The job runs within seconds and retries with exponential backoff
   * if storage is temporarily unavailable. If pg-boss is down at enqueue
   * time, the soft delete still succeeds and the weekly reconciler
   * (NoveltyEvidenceReconcilerService) catches the orphan on its next run.
   */
  async softDelete(
    id: bigint,
    actorUserId?: number,
  ): Promise<WorkOrderNoveltyEntity> {
    const existing = await this.findById(id);
    if (existing.deletedAt) {
      throw new NotFoundException(`Novedad con ID ${id} no encontrada`);
    }

    const softDeleted = await this.repository.softDelete(id, new Date());

    if (existing.fotoUrl) {
      try {
        await this.evidenceQueue.enqueueCleanup(
          softDeleted.novedadId,
          existing.fotoUrl,
        );
        this.logger.debug(
          `[WORK-ORDER-NOVELTY] evidence_cleanup outcome=enqueued novedad=${softDeleted.novedadId} key=${existing.fotoUrl} actor=${actorUserId ?? 'system'}`,
        );
      } catch (error) {
        // Queue unavailable — log and rely on the reconciler.
        this.logger.warn(
          `[WORK-ORDER-NOVELTY] evidence_cleanup outcome=enqueue_failed novedad=${softDeleted.novedadId} key=${existing.fotoUrl} actor=${actorUserId ?? 'system'} error=${(error as Error).message}`,
        );
      }
    }

    return softDeleted;
  }
}
