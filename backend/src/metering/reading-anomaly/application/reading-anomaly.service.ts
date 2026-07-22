import { Injectable } from '@nestjs/common';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import {
  uploadEvidence,
  rollbackEvidenceUpload,
  deleteOldEvidence,
} from 'src/infrastructure/common/utils/evidence-upload.util';
import { CreateReadingAnomalyDto } from '../interfaces/dto/create-reading-anomaly.dto';
import { UpdateReadingAnomalyDto } from '../interfaces/dto/update-reading-anomaly.dto';
import { CreateReadingAnomalyUseCase } from './use-cases/create-reading-anomaly.use-case';
import { FindAllReadingAnomaliesUseCase } from './use-cases/find-all-reading-anomalies.use-case';
import { FindOneReadingAnomalyUseCase } from './use-cases/find-one-reading-anomaly.use-case';
import { UpdateReadingAnomalyUseCase } from './use-cases/update-reading-anomaly.use-case';
import { RemoveReadingAnomalyUseCase } from './use-cases/remove-reading-anomaly.use-case';
import { ReadingAnomalyEntity } from '../domain/entities/reading-anomaly.entity';
import { ReadingAnomalyFilters } from '../domain/repositories/reading-anomaly.repository';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { LogContext } from 'src/shared/decorators/log-context.decorator';

@LogContext()
@Injectable()
export class ReadingAnomalyService {
  constructor(
    private readonly createUseCase: CreateReadingAnomalyUseCase,
    private readonly findAllUseCase: FindAllReadingAnomaliesUseCase,
    private readonly findOneUseCase: FindOneReadingAnomalyUseCase,
    private readonly updateUseCase: UpdateReadingAnomalyUseCase,
    private readonly removeUseCase: RemoveReadingAnomalyUseCase,
    private readonly storageService: StorageService,
    private readonly logger: LoggerService,
  ) {}

  async create(
    createDto: CreateReadingAnomalyDto,
    file?: Express.Multer.File,
  ): Promise<ReadingAnomalyEntity> {
    let fotoUrl = createDto.fotoUrl;
    let uploadedKey: string | undefined;

    if (file) {
      uploadedKey = await uploadEvidence(
        file,
        this.storageService,
        SRI_STORAGE_TYPES.READING_NEWS,
        'reading-news',
        this.logger,
      );
      fotoUrl = uploadedKey;
    }

    try {
      return await this.createUseCase.execute({ ...createDto, fotoUrl });
    } catch (error) {
      if (uploadedKey) {
        await rollbackEvidenceUpload(
          uploadedKey,
          this.storageService,
          SRI_STORAGE_TYPES.READING_NEWS,
          this.logger,
          'READING-ANOMALY',
        );
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: ReadingAnomalyFilters,
  ): Promise<PaginatedResult<ReadingAnomalyEntity>> {
    return this.findAllUseCase.execute(page, limit, filters);
  }

  async findOne(id: bigint): Promise<ReadingAnomalyEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(
    id: bigint,
    updateDto: UpdateReadingAnomalyDto,
    file?: Express.Multer.File,
  ): Promise<ReadingAnomalyEntity> {
    const existingAnomaly = await this.findOneUseCase.execute(id);

    let newFotoUrl: string | undefined;
    const oldFotoUrl = existingAnomaly.fotoUrl || undefined;

    if (file) {
      newFotoUrl = await uploadEvidence(
        file,
        this.storageService,
        SRI_STORAGE_TYPES.READING_NEWS,
        'reading-news',
        this.logger,
      );
      updateDto.fotoUrl = newFotoUrl;
    }

    try {
      const result = await this.updateUseCase.execute(id, updateDto);

      await deleteOldEvidence(
        oldFotoUrl || '',
        newFotoUrl || '',
        this.storageService,
        SRI_STORAGE_TYPES.READING_NEWS,
        this.logger,
        'READING-ANOMALY',
      );

      return result;
    } catch (error) {
      if (newFotoUrl) {
        await rollbackEvidenceUpload(
          newFotoUrl,
          this.storageService,
          SRI_STORAGE_TYPES.READING_NEWS,
          this.logger,
          'READING-ANOMALY',
        );
      }
      throw error;
    }
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
