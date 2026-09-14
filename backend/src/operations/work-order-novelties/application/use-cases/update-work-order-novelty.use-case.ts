import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../../domain/repositories/work-order-novelty.repository';
import { WorkOrderNoveltyEntity } from '../../domain/entities/work-order-novelty.entity';
import { NoveltyLifecyclePolicy } from '../../domain/policies/novelty-lifecycle.policy';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import { uploadEvidence } from 'src/infrastructure/common/utils/evidence-upload.util';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import {
  EstadoNovedad,
  ResolucionEconomicaAnomalia,
  TipoAnomalia,
} from 'src/shared/enums';
import { FindWorkOrderNoveltyUseCase } from './find-work-order-novelty.use-case';

export interface UpdateWorkOrderNoveltyInput {
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
export class UpdateWorkOrderNoveltyUseCase {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
    private readonly findUseCase: FindWorkOrderNoveltyUseCase,
    private readonly storageService: StorageService,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    id: bigint,
    dto: UpdateWorkOrderNoveltyInput,
    file?: Express.Multer.File,
    actorUserId?: number,
  ): Promise<WorkOrderNoveltyEntity> {
    const existing = await this.findUseCase.execute(id);

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
}
