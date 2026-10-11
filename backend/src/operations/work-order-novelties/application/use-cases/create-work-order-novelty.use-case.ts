import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  WORK_ORDER_NOVELTY_REPOSITORY,
  type WorkOrderNoveltyRepository,
} from '../../domain/repositories/work-order-novelty.repository';
import type { WorkOrderNoveltyRow } from '../../infrastructure/repositories/work-order-novelty.include';
import { OrdenTrabajoRepository } from 'src/operations/work-orders/domain/repositories/orden-trabajo.repository';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import {
  rollbackEvidenceUpload,
  uploadEvidence,
} from 'src/infrastructure/storage/evidence-upload.util';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { TipoAnomalia } from 'src/shared/enums';

export interface CreateWorkOrderNoveltyInput {
  ordenTrabajoId: string;
  lecturaId?: string | null;
  observacion?: string | null;
  tipo: TipoAnomalia;
  fotoUrl?: string | null;
}

@Injectable()
export class CreateWorkOrderNoveltyUseCase {
  constructor(
    @Inject(WORK_ORDER_NOVELTY_REPOSITORY)
    private readonly repository: WorkOrderNoveltyRepository,
    private readonly ordenTrabajoRepository: OrdenTrabajoRepository,
    private readonly storageService: StorageService,
    private readonly logger: LoggerService,
  ) {}

  async execute(
    dto: CreateWorkOrderNoveltyInput,
    file?: Express.Multer.File,
  ): Promise<WorkOrderNoveltyRow> {
    const ordenTrabajoId = BigInt(dto.ordenTrabajoId);
    const order = await this.ordenTrabajoRepository.findById(ordenTrabajoId);

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

    try {
      return await this.repository.create({
        ordenTrabajoId,
        lecturaId,
        observacion: dto.observacion ?? null,
        tipo: dto.tipo,
        fotoUrl,
      });
    } catch (error) {
      if (file && fotoUrl) {
        await rollbackEvidenceUpload(
          fotoUrl,
          this.storageService,
          SRI_STORAGE_TYPES.READING_NEWS,
          this.logger,
          'WORK-ORDER-NOVELTY',
        );
      }
      throw error;
    }
  }
}
