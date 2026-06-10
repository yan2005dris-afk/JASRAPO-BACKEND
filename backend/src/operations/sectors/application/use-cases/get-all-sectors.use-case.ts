import { Injectable } from '@nestjs/common';
import { SectorRepository } from '../../domain/repositories/sector.repository';

@Injectable()
export class GetAllSectorsUseCase {
  constructor(private readonly sectorRepository: SectorRepository) {}

  async execute() {
    return this.sectorRepository.findMany();
  }
}
