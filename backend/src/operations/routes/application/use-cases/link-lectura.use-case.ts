import { Injectable } from '@nestjs/common';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import type { LinkLecturaData } from '../../domain/types/orden-trabajo.types';

@Injectable()
export class LinkLecturaUseCase {
  constructor(private readonly ordenTrabajoRepository: OrdenTrabajoRepository) {}

  async execute(
    ordenTrabajoId: bigint,
    data: LinkLecturaData,
  ): Promise<OrdenTrabajoEntity> {
    return this.ordenTrabajoRepository.linkLectura(ordenTrabajoId, data);
  }
}
