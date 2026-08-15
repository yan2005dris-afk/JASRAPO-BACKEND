import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { UpdateSectorDto } from '../../interfaces/dto/update-sector.dto';
import { SectorEntity } from '../../domain/entities/sector.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(id: number, dto: UpdateSectorDto): Promise<SectorEntity> {
    const sector = await this.sectorRepository.findById(id);

    if (!sector) {
      throw new EntityNotFoundException('Sector', id);
    }

    if (dto.comunidadId !== undefined) {
      const comunidad = await this.sectorRepository.findComunidadById(
        dto.comunidadId,
      );
      if (!comunidad) {
        throw new EntityNotFoundException('Comunidad', dto.comunidadId);
      }
    }

    return this.sectorRepository.update(id, dto);
  }
}
