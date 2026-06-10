import { Injectable, NotFoundException } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { UpdateSectorDto } from '../../interfaces/dto/update-sector.dto';

@Injectable()
export class UpdateSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(id: number, dto: UpdateSectorDto) {
    const sector = await this.sectorRepository.findUnique({ sectorId: id });

    if (!sector || sector.deletedAt !== null) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    return this.sectorRepository.update({ sectorId: id }, dto);
  }
}
