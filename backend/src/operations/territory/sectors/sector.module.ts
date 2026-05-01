import { Module } from '@nestjs/common';
import { SectorService } from './sector.service';
import { SectorController } from './sector.controller';
import { CreateSectorUseCase } from './use-cases/create-sector.use-case';
import { UpdateSectorUseCase } from './use-cases/update-sector.use-case';
import { GetAllSectorsUseCase } from './use-cases/get-all-sectors.use-case';
import { GetSectorUseCase } from './use-cases/get-sector.use-case';
import { DeleteSectorUseCase } from './use-cases/delete-sector.use-case';

@Module({
  controllers: [SectorController],
  providers: [
    SectorService,
    CreateSectorUseCase,
    UpdateSectorUseCase,
    GetAllSectorsUseCase,
    GetSectorUseCase,
    DeleteSectorUseCase,
  ],
  exports: [
    SectorService,
    CreateSectorUseCase,
    UpdateSectorUseCase,
    GetAllSectorsUseCase,
    GetSectorUseCase,
    DeleteSectorUseCase,
  ],
})
export class SectorModule {}
