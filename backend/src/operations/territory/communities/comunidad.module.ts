import { Module } from '@nestjs/common';
import { ComunidadService } from './comunidad.service';
import { ComunidadController } from './comunidad.controller';
import { CreateCommunityUseCase } from './use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from './use-cases/update-community.use-case';
import { GetAllCommunitiesUseCase } from './use-cases/get-all-communities.use-case';
import { GetCommunityUseCase } from './use-cases/get-community.use-case';
import { DeleteCommunityUseCase } from './use-cases/delete-community.use-case';

@Module({
  controllers: [ComunidadController],
  providers: [
    ComunidadService,
    CreateCommunityUseCase,
    UpdateCommunityUseCase,
    GetAllCommunitiesUseCase,
    GetCommunityUseCase,
    DeleteCommunityUseCase,
  ],
  exports: [ComunidadService],
})
export class ComunidadModule {}
