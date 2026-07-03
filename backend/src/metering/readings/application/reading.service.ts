import { Injectable, Logger } from '@nestjs/common';
import {
  StorageService,
  SRI_STORAGE_TYPES,
} from 'src/infrastructure/storage/storage.service';
import {
  uploadEvidence,
  rollbackEvidenceUpload,
  deleteOldEvidence,
} from 'src/infrastructure/common/utils/evidence-upload.util';
import { EstadoLectura } from 'src/shared/enums';
import { CrearLecturaDto } from '../interfaces/dto/create-lectura.dto';
import { ActualizarLecturaDto } from '../interfaces/dto/update-lectura.dto';
import { CreateReadingUseCase } from './use-cases/create-reading.use-case';
import { FindAllReadingsUseCase } from './use-cases/find-all-readings.use-case';
import { FindOneReadingUseCase } from './use-cases/find-one-reading.use-case';
import { UpdateReadingUseCase } from './use-cases/update-reading.use-case';
import { RemoveReadingUseCase } from './use-cases/remove-reading.use-case';
import { LecturaEntity } from '../domain/entities/lectura.entity';
import { ReadingFilters } from '../domain/repositories/reading.repository';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class ReadingService {
  private readonly logger = new Logger(ReadingService.name);

  constructor(
    private readonly createUseCase: CreateReadingUseCase,
    private readonly findAllUseCase: FindAllReadingsUseCase,
    private readonly findOneUseCase: FindOneReadingUseCase,
    private readonly updateUseCase: UpdateReadingUseCase,
    private readonly removeUseCase: RemoveReadingUseCase,
    private readonly storageService: StorageService,
  ) {}

  async create(
    createDto: CrearLecturaDto,
    file?: Express.Multer.File,
  ): Promise<LecturaEntity> {
    let fotoUrl = createDto.fotoUrl;
    let uploadedKey: string | undefined;

    if (file) {
      uploadedKey = await uploadEvidence(
        file,
        this.storageService,
        SRI_STORAGE_TYPES.READINGS,
        'readings',
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
          SRI_STORAGE_TYPES.READINGS,
          this.logger,
          'READINGS',
        );
      }
      throw error;
    }
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: ReadingFilters,
  ): Promise<PaginatedResult<LecturaEntity>> {
    return this.findAllUseCase.execute(page, limit, filters);
  }

  async findOne(id: bigint): Promise<LecturaEntity> {
    return this.findOneUseCase.execute(id);
  }

  async update(
    id: bigint,
    updateDto: ActualizarLecturaDto,
    targetEstado?: EstadoLectura,
    file?: Express.Multer.File,
  ): Promise<LecturaEntity> {
    const existingReading = await this.findOneUseCase.execute(id);

    let newFotoUrl: string | undefined;
    const oldFotoUrl = existingReading.fotoUrl || undefined;

    if (file) {
      newFotoUrl = await uploadEvidence(
        file,
        this.storageService,
        SRI_STORAGE_TYPES.READINGS,
        'readings',
        this.logger,
      );
      updateDto.fotoUrl = newFotoUrl;
    }

    try {
      const result = await this.updateUseCase.execute(
        id,
        updateDto,
        targetEstado,
      );

      await deleteOldEvidence(
        oldFotoUrl || '',
        newFotoUrl || '',
        this.storageService,
        SRI_STORAGE_TYPES.READINGS,
        this.logger,
        'READINGS',
      );

      return result;
    } catch (error) {
      if (newFotoUrl) {
        await rollbackEvidenceUpload(
          newFotoUrl,
          this.storageService,
          SRI_STORAGE_TYPES.READINGS,
          this.logger,
          'READINGS',
        );
      }
      throw error;
    }
  }

  async delete(id: bigint): Promise<{ message: string }> {
    return this.removeUseCase.execute(id);
  }
}
