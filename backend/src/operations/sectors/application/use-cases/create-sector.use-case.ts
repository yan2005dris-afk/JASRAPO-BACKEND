import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { CreateSectorDto } from '../../interfaces/dto/create-sector.dto';
import type { SectorRow } from '../../infrastructure/repositories/sector.include';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class CreateSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(dto: CreateSectorDto): Promise<SectorRow> {
    const comunidad = await this.sectorRepository.findComunidadById(
      dto.comunidadId,
    );

    if (!comunidad) {
      throw new EntityNotFoundException('Comunidad', dto.comunidadId);
    }

    return this.sectorRepository.create(dto);
  }
}
