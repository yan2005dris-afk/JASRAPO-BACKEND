import { Injectable, ConflictException } from '@nestjs/common';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import type { CreateRubroData } from '../../domain/types/rubro.types';
import type { RubroEntity } from '../../domain/entities/rubro.entity';

@Injectable()
export class CreateRubroUseCase {
  constructor(private readonly rubroRepository: RubroRepository) {}

  async execute(data: CreateRubroData): Promise<RubroEntity> {
    if (data.codigoSri?.trim()) {
      const existing = await this.rubroRepository.findByCodigoSri(data.codigoSri.trim());
      if (existing) {
        throw new ConflictException(`Ya existe un rubro con el código SRI '${data.codigoSri}'`);
      }
    }

    return this.rubroRepository.create({
      ...data,
      codigoSri: data.codigoSri?.trim() || null,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      precioUnitario: Number(data.precioUnitario),
      activo: data.activo ?? true,
      esAutomatico: false,
    });
  }
}
