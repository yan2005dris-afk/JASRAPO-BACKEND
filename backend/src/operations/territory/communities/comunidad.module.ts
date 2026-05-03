import { Module } from '@nestjs/common';
import { ComunidadService } from './comunidad.service';
import { ComunidadController } from './comunidad.controller';
import { CreateCommunityUseCase } from './use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from './use-cases/update-community.use-case';
import { FindAllCommunitiesUseCase } from './use-cases/find-all-communities.use-case';
import { FindAllCommunitiesWithSectorUseCase } from './use-cases/find-all-communities-with-sector.use-case';
import { FindOneCommunityUseCase } from './use-cases/find-one-community.use-case';
import { DeleteCommunityUseCase } from './use-cases/delete-community.use-case';

@Module({
  controllers: [ComunidadController],
  providers: [
    ComunidadService,
    CreateCommunityUseCase,
    UpdateCommunityUseCase,
    FindAllCommunitiesUseCase,
    FindAllCommunitiesWithSectorUseCase,
    FindOneCommunityUseCase,
    DeleteCommunityUseCase,
  ],
  exports: [ComunidadService],
})
export class ComunidadModule {}
