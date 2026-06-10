import { Module } from '@nestjs/common';
import { SectorService } from './application/sector.service';
import { SectorController } from './interfaces/http/sector.controller';
import { CreateSectorUseCase } from './application/use-cases/create-sector.use-case';
import { UpdateSectorUseCase } from './application/use-cases/update-sector.use-case';
import { GetAllSectorsUseCase } from './application/use-cases/get-all-sectors.use-case';
import { GetSectorUseCase } from './application/use-cases/get-sector.use-case';
import { DeleteSectorUseCase } from './application/use-cases/delete-sector.use-case';
import { SectorRepository } from './domain/repositories/sector.repository';
import { PrismaSectorRepository } from './infrastructure/repositories/prisma-sector.repository';

@Module({
  controllers: [SectorController],
  providers: [
    { provide: SectorRepository, useClass: PrismaSectorRepository },
    SectorService,
    CreateSectorUseCase,
    UpdateSectorUseCase,
    GetAllSectorsUseCase,
    GetSectorUseCase,
    DeleteSectorUseCase,
  ],
  exports: [
    SectorRepository,
    SectorService,
    CreateSectorUseCase,
    UpdateSectorUseCase,
    GetAllSectorsUseCase,
    GetSectorUseCase,
    DeleteSectorUseCase,
  ],
})
export class SectorModule {}
