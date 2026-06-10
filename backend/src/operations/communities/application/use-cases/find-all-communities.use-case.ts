import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { safeCommunitiesSelect } from '../../domain/types/IResponseCommunities';
import { toComunidadResponse } from '../../domain/types/communitiesMapper';

@Injectable()
export class FindAllCommunitiesUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute() {
    const comunidades = await this.communityRepository.findMany({
      where: { deletedAt: null },
      select: safeCommunitiesSelect,
    });
    return comunidades.map(toComunidadResponse);
  }
}
