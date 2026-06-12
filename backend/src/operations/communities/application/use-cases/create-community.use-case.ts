import { ConflictException, Injectable } from '@nestjs/common';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CreateComunidadDto } from '../../interfaces/dto/create-comunidad.dto';

@Injectable()
export class CreateCommunityUseCase {
  constructor(private readonly communityRepository: CommunityRepository) {}

  async execute(dto: CreateComunidadDto) {
    // Buscar comunidad activa por nombre O código
    const existing = await this.communityRepository.findFirst({
      deletedAt: null,
      OR: [
        { nombre: { equals: dto.nombre, mode: 'insensitive' } },
        { codigo: dto.codigo },
      ],
    });

    if (existing) {
      if (existing.nombre.toLowerCase() === dto.nombre.toLowerCase()) {
        throw new ConflictException('Ya existe una comunidad con ese nombre');
      }
      throw new ConflictException('Ya existe una comunidad con ese código');
    }

    // Si hay código pero está eliminado -> reaccionar
    const deletedWithCode = await this.communityRepository.findUnique({
      codigo: dto.codigo,
    });

    if (deletedWithCode?.deletedAt) {
      const reactivated = await this.communityRepository.update(
        { comunidadId: deletedWithCode.comunidadId },
        {
          nombre: dto.nombre,
          porcentajeTasaSeguridad: dto.porcentajeTasaSeguridad,
          deletedAt: null,
        },
      );
      return reactivated;
    }

    const created = await this.communityRepository.create(dto);

    return created;
  }
}
