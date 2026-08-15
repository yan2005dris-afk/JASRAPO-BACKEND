import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { CreateSectorDto } from '../../interfaces/dto/create-sector.dto';
import { SectorEntity } from '../../domain/entities/sector.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(dto: CreateSectorDto): Promise<SectorEntity> {
    const comunidad = await this.sectorRepository.findComunidadById(
      dto.comunidadId,
    );

    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', dto.comunidadId);
    }

    return this.sectorRepository.create(dto);
  }
}
