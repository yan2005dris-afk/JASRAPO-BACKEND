import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { SectorEntity } from '../../domain/entities/sector.entity';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class DeleteSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(id: number): Promise<SectorEntity> {
    const sector = await this.sectorRepository.findById(id);

    if (!sector) {
      throw new EntityNotFoundException('Sector', id);
    }

    return this.sectorRepository.softDelete(id);
  }
}
