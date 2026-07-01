import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import { ImageProcessorUtil } from 'src/infrastructure/common/utils/image-processor.util';
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

@Injectable()
export class ReadingAnomalyService {
  private readonly logger = new Logger(ReadingAnomalyService.name);

  constructor(
    private readonly createUseCase: CreateReadingAnomalyUseCase,
    private readonly findAllUseCase: FindAllReadingAnomaliesUseCase,
    private readonly findOneUseCase: FindOneReadingAnomalyUseCase,
    private readonly updateUseCase: UpdateReadingAnomalyUseCase,
    private readonly removeUseCase: RemoveReadingAnomalyUseCase,
    private readonly storageService: StorageService,
  ) {}

  private async uploadAndProcessImage(
    file: Express.Multer.File,
  ): Promise<string> {
    this.logger.debug(
      `[READING-ANOMALY] Procesando evidencia con ImageProcessorUtil (${file.size} bytes)`,
    );
    const processedBuffer = await ImageProcessorUtil.toWebP(file.buffer, {
      width: 1024,
      quality: 80,
    });
    const key = `reading-news/${randomUUID()}.webp`;
    this.logger.debug(`[READING-ANOMALY] Subiendo a storage con key: ${key}`);
    await this.storageService.upload(
      SRI_STORAGE_TYPES.READING_NEWS,
      key,
      processedBuffer,
      { contentType: 'image/webp' },
    );
    return key;
  }

  async create(
    createDto: CreateReadingAnomalyDto,
    file?: Express.Multer.File,
  ): Promise<ReadingAnomalyEntity> {
    let fotoUrl = createDto.fotoUrl;
    let uploadedKey: string | undefined;

    if (file) {
      uploadedKey = await this.uploadAndProcessImage(file);
      fotoUrl = uploadedKey;
    }

    try {
      return await this.createUseCase.execute({ ...createDto, fotoUrl });
    } catch (error) {
      if (uploadedKey) {
        this.logger.warn(
          `[READING-ANOMALY] Revirtiendo subida por fallo en creación de anomalía: ${uploadedKey}`,
        );
        await this.storageService
          .delete(SRI_STORAGE_TYPES.READING_NEWS, uploadedKey)
          .catch(() => {});
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
      newFotoUrl = await this.uploadAndProcessImage(file);
      updateDto.fotoUrl = newFotoUrl;
    }

    try {
      const result = await this.updateUseCase.execute(id, updateDto);

      if (newFotoUrl && oldFotoUrl) {
        await this.storageService
          .delete(SRI_STORAGE_TYPES.READING_NEWS, oldFotoUrl)
          .catch((e) =>
            this.logger.warn(
              `[READING-ANOMALY] No se pudo borrar la evidencia anterior (${oldFotoUrl}): ${e.message}`,
            ),
          );
      }
      return result;
    } catch (error) {
      if (newFotoUrl) {
        this.logger.warn(
          `[READING-ANOMALY] Revirtiendo subida por fallo en actualización: ${newFotoUrl}`,
        );
        await this.storageService
          .delete(SRI_STORAGE_TYPES.READING_NEWS, newFotoUrl)
          .catch(() => {});
      }
      throw error;
    }
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
