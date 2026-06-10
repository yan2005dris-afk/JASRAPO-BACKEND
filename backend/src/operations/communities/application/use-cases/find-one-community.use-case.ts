import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { safeCommunitiesSelect } from '../../domain/types/IResponseCommunities';
import { toComunidadResponse } from '../../domain/types/communitiesMapper';

@Injectable()
export class FindOneCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(id: number) {
    const comunidad = await this.communityRepository.findUnique(
      { comunidadId: id, deletedAt: null },
      safeCommunitiesSelect,
    );

    if (!comunidad) {
      throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
    }

    return toComunidadResponse(comunidad);
  }
}
