import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';
import { UpdateSectorDto } from '../../interfaces/dto/update-sector.dto';

@Injectable()
export class UpdateSectorUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute(id: number, dto: UpdateSectorDto) {
    return this.sectorRepository.update({ sectorId: id }, dto as any);
  }
}
