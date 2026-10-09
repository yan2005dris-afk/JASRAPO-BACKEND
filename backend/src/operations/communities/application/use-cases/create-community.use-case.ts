import { Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CreateComunidadDto } from '../../interfaces/dto/create-comunidad.dto';
import type { CommunityRow } from '../../domain/types/community.types';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(dto: CreateComunidadDto): Promise<CommunityRow> {
    const existing = await this.communityRepository.findActiveByNameOrCode(
      dto.nombre,
      dto.codigo,
    );

    if (existing) {
      if (existing.nombre.toLowerCase() === dto.nombre.toLowerCase()) {
        throw new EntityAlreadyExistsException('Comunidad', dto.nombre);
      }
      throw new EntityAlreadyExistsException('Comunidad', dto.codigo);
    }

    const deletedWithCode = await this.communityRepository.findByCodigo(
      dto.codigo,
    );

    if (deletedWithCode?.deletedAt) {
      return this.communityRepository.reactivate(deletedWithCode.comunidadId, {
        nombre: dto.nombre,
        porcentajeTasaSeguridad: dto.porcentajeTasaSeguridad,
      });
    }

    return this.communityRepository.create(dto);
  }
}
