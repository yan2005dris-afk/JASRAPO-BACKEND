import { Injectable } from '@nestjs/common';
import { CreateSectorDto } from '../interfaces/dto/create-sector.dto';
import { UpdateSectorDto } from '../interfaces/dto/update-sector.dto';
import { CreateSectorUseCase } from './use-cases/create-sector.use-case';
import { UpdateSectorUseCase } from './use-cases/update-sector.use-case';
import { GetAllSectorsUseCase } from './use-cases/get-all-sectors.use-case';
import { GetSectorUseCase } from './use-cases/get-sector.use-case';
import { DeleteSectorUseCase } from './use-cases/delete-sector.use-case';

export interface IRespuestaSector {
  message: string;
  statusCode: number;
}

@Injectable()
export class SectorService {
  constructor(
    private readonly createUseCase: CreateSectorUseCase,
    private readonly updateUseCase: UpdateSectorUseCase,
    private readonly getAllUseCase: GetAllSectorsUseCase,
    private readonly getOneUseCase: GetSectorUseCase,
    private readonly deleteUseCase: DeleteSectorUseCase,
  ) {}

  async crearSector(dto: CreateSectorDto): Promise<IRespuestaSector> {
    return this.createUseCase.execute(dto);
  }

  async findAll() {
    return this.getAllUseCase.execute();
  }

  async findOne(id: number) {
    return this.getOneUseCase.execute(id);
  }

  async actualizarSector(id: number, dto: UpdateSectorDto) {
    return this.updateUseCase.execute(id, dto);
  }

  async eliminarSector(id: number) {
    return this.deleteUseCase.execute(id);
  }
}
