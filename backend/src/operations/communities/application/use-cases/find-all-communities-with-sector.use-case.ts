import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';

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
    });
    return comunidades;
  }
}
