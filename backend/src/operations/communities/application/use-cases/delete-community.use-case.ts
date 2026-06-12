import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';

@Injectable()
export class DeleteCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(id: number) {
    const existing = await this.communityRepository.findUnique({
      comunidadId: id,
    });

    if (!existing) {
      throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
    }

    const deleted = await this.communityRepository.update(
      { comunidadId: id },
      { deletedAt: new Date() },
    );

    return deleted;
  }
}
