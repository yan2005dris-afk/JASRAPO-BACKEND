import { Injectable } from '@nestjs/common';
import { TariffRepository } from '../../domain/repositories/tariff.repository';
import { RubroRepository } from '../../../rubros/domain/repositories/rubro.repository';
import type { CreateCategoriaTarifaDto } from '../../interfaces/dto/create-categoria-tarifa.dto';
import type { TariffCategoryEntity } from '../../domain/entities/tariff-category.entity';
import { EntityAlreadyExistsException } from 'src/shared/domain/exceptions/domain.exception';
import { TarifaImpuestoNotFoundException } from '../../../rubros/domain/exceptions/rubro.exceptions';

@Injectable()
export class CreateTariffCategoryUseCase {
  constructor(
    private readonly tariffRepository: TariffRepository,
    private readonly rubroRepository: RubroRepository,
  ) {}

  async execute(dto: CreateCategoriaTarifaDto): Promise<TariffCategoryEntity> {
    const existing = await this.tariffRepository.findActiveByNombre(dto.nombre);

    if (existing) {
      throw new EntityAlreadyExistsException('CategoriaTarifa', dto.nombre);
    }

    // 1. Resolver tarifaImpuestoId para los Rubros auto-creados
    const tarifaImpuestoId = await this.resolveTarifaImpuestoId(
      dto.tarifaImpuestoId,
    );

    // 2. Crear la CategoriaTarifa
    const categoria = await this.tariffRepository.create(dto);

    // 3. Auto-crear los 3 Rubros default vinculados a la categoria
    await this.createDefaultRubros(
      categoria.categoriaTarifaId,
      tarifaImpuestoId,
      {
        valorBase: dto.valorBase,
        consumoMinimoMensual: dto.consumoMinimoMensual,
        valorExcedenteM3: dto.valorExcedenteM3,
      },
    );

    return categoria;
  }

  private async resolveTarifaImpuestoId(providedId?: number): Promise<number> {
    if (providedId !== undefined) {
      return providedId;
    }
    const tarifas = await this.rubroRepository.findTarifasImpuesto();
    const first = tarifas.find((t) => t.activo);
    if (!first) {
      throw new TarifaImpuestoNotFoundException();
    }
    return first.id;
  }

  private async createDefaultRubros(
    categoriaTarifaId: number,
    tarifaImpuestoId: number,
    prices: {
      valorBase?: number;
      consumoMinimoMensual?: number;
      valorExcedenteM3?: number;
    },
  ): Promise<void> {
    const defaults = [
      {
        codigoSri: `CARGO-FIJO-${categoriaTarifaId}`,
        nombre: 'Cargo fijo',
        descripcion: 'Cargo fijo mensual por servicio',
        precioUnitario: prices.valorBase ?? 0,
        tipoRubro: 'FIJO' as const,
      },
      {
        codigoSri: `CONS-MIN-${categoriaTarifaId}`,
        nombre: 'Consumo mínimo',
        descripcion: 'Cargo por consumo mínimo mensual (m³)',
        precioUnitario: prices.consumoMinimoMensual ?? 0,
        tipoRubro: 'VARIABLE' as const,
      },
      {
        codigoSri: `EXC-M3-${categoriaTarifaId}`,
        nombre: 'Excedente m³',
        descripcion: 'Cargo por metro cúbico excedente',
        precioUnitario: prices.valorExcedenteM3 ?? 0,
        tipoRubro: 'VARIABLE' as const,
      },
    ];

    for (const r of defaults) {
      await this.rubroRepository.create({
        ...r,
        tarifaImpuestoId,
        categoriaTarifaId,
        esAutomatico: true,
      });
    }
  }
}
