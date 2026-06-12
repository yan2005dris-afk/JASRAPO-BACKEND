import { Injectable, NotFoundException } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';

@Injectable()
export class DeleteSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(id: number) {
    const sector = await this.sectorRepository.findUnique({ sectorId: id });

    if (!sector || sector.deletedAt !== null) {
      throw new NotFoundException(`Sector con ID ${id} no encontrado`);
    }

    await this.sectorRepository.delete({ sectorId: id });

    return { message: 'Sector eliminado exitosamente.', statusCode: 200 };
  }
}
