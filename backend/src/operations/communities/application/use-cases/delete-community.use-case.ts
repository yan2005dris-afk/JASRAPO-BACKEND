import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import type { CommunityRow } from '../../domain/types/community.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class DeleteCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(id: number): Promise<CommunityRow> {
    const existing = await this.communityRepository.findById(id);

    if (!existing) {
      throw new EntityNotFoundException('Comunidad', id);
    }

    return this.communityRepository.softDelete(id);
  }
}
