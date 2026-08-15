import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class FindOneCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(id: number): Promise<CommunityEntity> {
    const comunidad = await this.communityRepository.findById(id);

    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', id);
    }

    return comunidad;
  }
}
