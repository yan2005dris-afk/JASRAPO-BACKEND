import { Injectable } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { UpdateRubroData } from '../../domain/types/rubro.types';
import type { RubroEntity } from '../../domain/entities/rubro.entity';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class UpdateRubroUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(id: number, data: UpdateRubroData): Promise<RubroEntity> {
    const existing = await this.rubroRepository.findById(id);
    if (!existing) {
      throw new EntityNotFoundException('Rubro', id);
    }

    if (data.codigoSri?.trim()) {
      const codeOwner = await this.rubroRepository.findByCodigoSri(
        data.codigoSri.trim(),
      );
      if (codeOwner && codeOwner.rubroId !== id) {
        throw new EntityAlreadyExistsException(
          'Rubro',
          'código SRI',
          data.codigoSri,
        );
      }
    }

    return this.rubroRepository.update(id, {
      ...data,
      ...(data.codigoSri !== undefined
        ? { codigoSri: data.codigoSri?.trim() || null }
        : {}),
      ...(data.nombre !== undefined ? { nombre: data.nombre.trim() } : {}),
      ...(data.descripcion !== undefined
        ? { descripcion: data.descripcion.trim() }
        : {}),
      ...(data.precioUnitario !== undefined
        ? { precioUnitario: Number(data.precioUnitario) }
        : {}),
    });
  }
}
