import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { UpdateComunidadDto } from '../../interfaces/dto/update-comunidad.dto';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(id: number, dto: UpdateComunidadDto): Promise<CommunityEntity> {
    const existing = await this.communityRepository.findById(id);

    if (!existing) {
      throw new EntityNotFoundException('Comunidad', id);
    }

    return this.communityRepository.update(id, dto);
  }
}
