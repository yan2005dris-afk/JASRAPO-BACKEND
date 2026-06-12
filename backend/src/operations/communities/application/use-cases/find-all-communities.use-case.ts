import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';

@Injectable()
export class FindAllCommunitiesUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute() {
    const comunidades = await this.communityRepository.findMany({
      where: { deletedAt: null },
    });
    return comunidades;
  }
}
