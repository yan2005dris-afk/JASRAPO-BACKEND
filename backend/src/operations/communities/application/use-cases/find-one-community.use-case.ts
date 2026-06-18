import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';

@Injectable()
export class FindOneCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(id: number) {
    const comunidad = await this.communityRepository.findUnique({
      comunidadId: id,
      deletedAt: null,
    });

    if (!comunidad) {
      throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
    }

    return comunidad;
  }
}
