import { Injectable, NotFoundException } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';

@Injectable()
export class GetSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(id: number) {
    const sector = await this.sectorRepository.findUnique({ sectorId: id });

    if (!sector) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    return sector;
  }
}
