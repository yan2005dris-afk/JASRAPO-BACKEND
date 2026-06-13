import { Module } from '@nestjs/common';
import { ComunidadService } from './application/comunidad.service';
import { ComunidadController } from './interfaces/http/comunidad.controller';
import { CreateCommunityUseCase } from './application/use-cases/create-community.use-case';
import { UpdateCommunityUseCase } from './application/use-cases/update-community.use-case';
import { FindAllCommunitiesUseCase } from './application/use-cases/find-all-communities.use-case';
import { FindOneCommunityUseCase } from './application/use-cases/find-one-community.use-case';
import { DeleteCommunityUseCase } from './application/use-cases/delete-community.use-case';
import { CommunityRepository } from './domain/repositories/community.repository';
import { PrismaCommunityRepository } from './infrastructure/repositories/prisma-community.repository';

@Module({
  controllers: [ComunidadController],
  providers: [
    { provide: CommunityRepository, useClass: PrismaCommunityRepository },
    ComunidadService,
    CreateCommunityUseCase,
    UpdateCommunityUseCase,
    FindAllCommunitiesUseCase,
    FindOneCommunityUseCase,
    DeleteCommunityUseCase,
  ],
  exports: [
    CommunityRepository,
    ComunidadService,
    CreateCommunityUseCase,
    UpdateCommunityUseCase,
    FindAllCommunitiesUseCase,
    FindOneCommunityUseCase,
    DeleteCommunityUseCase,
  ],
})
export class ComunidadModule {}
