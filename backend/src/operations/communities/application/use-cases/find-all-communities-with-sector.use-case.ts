import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { safeCommunitiesSelectWithSector } from '../../domain/types/IResponseCommunities';
import { toComunidadResponse } from '../../domain/types/communitiesMapper';

@Injectable()
export class FindAllCommunitiesWithSectorUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(options?: { sectorId?: number }) {
    const where: Record<string, unknown> = { deletedAt: null };

    if (options?.sectorId) {
      where.sector = {
        some: { sectorId: options.sectorId, deletedAt: null },
      };
    }

    const comunidades = await this.communityRepository.findMany({
      where,
      select: safeCommunitiesSelectWithSector,
    });
    return comunidades.map(toComunidadResponse);
  }
}
