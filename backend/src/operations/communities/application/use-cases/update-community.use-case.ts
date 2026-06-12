import { Injectable, NotFoundException } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { UpdateComunidadDto } from '../../interfaces/dto/update-comunidad.dto';

@Injectable()
export class UpdateCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(id: number, dto: UpdateComunidadDto) {
    const existing = await this.communityRepository.findUnique({
      comunidadId: id,
      deletedAt: null,
    });

    if (!existing) {
      throw new NotFoundException(`Comunidad con ID ${id} no encontrada`);
    }

    const updated = await this.communityRepository.update(
      { comunidadId: id },
      dto,
    );

    return updated;
  }
}
