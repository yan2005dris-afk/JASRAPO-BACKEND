import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import type { SectorRow } from '../../domain/types/sector.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class GetSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(id: number): Promise<SectorRow> {
    const sector = await this.sectorRepository.findById(id);

    if (!sector) {
      throw new EntityNotFoundException('Sector', id);
    }

    return sector;
  }
}
