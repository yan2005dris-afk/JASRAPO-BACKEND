import { Injectable } from '@nestjs/common';
import { CreateSectorDto } from '../interfaces/dto/create-sector.dto';
import { UpdateSectorDto } from '../interfaces/dto/update-sector.dto';
import { CreateSectorUseCase } from './use-cases/create-sector.use-case';
import { UpdateSectorUseCase } from './use-cases/update-sector.use-case';
import { GetAllSectorsUseCase } from './use-cases/get-all-sectors.use-case';
import { GetSectorUseCase } from './use-cases/get-sector.use-case';
import { DeleteSectorUseCase } from './use-cases/delete-sector.use-case';
import type { SectorRow } from '../domain/types/sector.types';
import type { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class SectorService {
  constructor(
    private readonly createUseCase: CreateSectorUseCase,
    private readonly updateUseCase: UpdateSectorUseCase,
    private readonly getAllUseCase: GetAllSectorsUseCase,
    private readonly getOneUseCase: GetSectorUseCase,
    private readonly deleteUseCase: DeleteSectorUseCase,
  ) {}

  async crearSector(dto: CreateSectorDto): Promise<SectorRow> {
    return this.createUseCase.execute(dto);
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<SectorRow>> {
    return this.getAllUseCase.execute(page, limit);
  }

  async findOne(id: number): Promise<SectorRow> {
    return this.getOneUseCase.execute(id);
  }

  async actualizarSector(id: number, dto: UpdateSectorDto): Promise<SectorRow> {
    return this.updateUseCase.execute(id, dto);
  }

  async eliminarSector(id: number): Promise<SectorRow> {
    return this.deleteUseCase.execute(id);
  }
}
