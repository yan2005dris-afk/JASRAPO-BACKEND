import type {
  Rubros,
  CatalogoTarifasImpuesto,
  Prisma,
} from 'src/generated/prisma/client';
import { RubroEntity } from '../../domain/entities/rubro.entity';
import type {
  CreateRubroData,
  UpdateRubroData,
  RubroFilters,
  TarifaImpuestoInfo,
} from '../../domain/types/rubro.types';
import { Decimal } from 'decimal.js';

export type RubroWithTarifa = Rubros & {
  tarifaImpuesto?: CatalogoTarifasImpuesto | null;
  categoriaTarifaId?: number | null;
};

export class RubroMapper {
  static toDomain(raw: RubroWithTarifa | null | undefined): RubroEntity | null {
    if (!raw) return null;
    return new RubroEntity({
      rubroId: raw.rubroId,
      codigoSri: raw.codigoSri,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      precioUnitario:
        raw.precioUnitario instanceof Decimal
          ? raw.precioUnitario.toNumber()
          : Number(raw.precioUnitario),
      tipoRubro: raw.tipoRubro,
      codigoSistemaRubro: raw.codigoSistemaRubro,
      tarifaImpuestoId: raw.tarifaImpuestoId,
      categoriaTarifaId: raw.categoriaTarifaId,
      tarifaImpuesto: raw.tarifaImpuesto
        ? {
            id: raw.tarifaImpuesto.id,
            codigoPorcentaje: raw.tarifaImpuesto.codigoPorcentaje,
            porcentaje:
              raw.tarifaImpuesto.porcentaje instanceof Decimal
                ? raw.tarifaImpuesto.porcentaje.toNumber()
                : Number(raw.tarifaImpuesto.porcentaje),
            descripcion: raw.tarifaImpuesto.descripcion,
          }
        : undefined,
      activo: raw.activo,
      esAutomatico: raw.esAutomatico,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toDomainList(rawList: RubroWithTarifa[]): RubroEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((e): e is RubroEntity => e !== null);
  }

  static toPrismaCreateInput(
    data: CreateRubroData,
  ): Prisma.RubrosUncheckedCreateInput {
    const base: Prisma.RubrosUncheckedCreateInput = {
      codigoSri: data.codigoSri?.trim() ? data.codigoSri.trim() : null,
      nombre: data.nombre.trim(),
      descripcion: data.descripcion.trim(),
      precioUnitario: new Decimal(data.precioUnitario),
      tipoRubro: data.tipoRubro,
      tarifaImpuestoId: data.tarifaImpuestoId,
      activo: data.activo ?? true,
      esAutomatico: data.esAutomatico ?? false,
    };
    if (data.categoriaTarifaId !== undefined) {
      return {
        ...base,
        categoriaTarifaId: data.categoriaTarifaId,
      };
    }
    return base;
  }

  static toPrismaUpdateInput(
    data: UpdateRubroData,
  ): Prisma.RubrosUncheckedUpdateInput {
    return {
      ...(data.codigoSri !== undefined
        ? { codigoSri: data.codigoSri?.trim() ? data.codigoSri.trim() : null }
        : {}),
      ...(data.nombre !== undefined ? { nombre: data.nombre.trim() } : {}),
      ...(data.descripcion !== undefined
        ? { descripcion: data.descripcion.trim() }
        : {}),
      ...(data.precioUnitario !== undefined
        ? { precioUnitario: new Decimal(data.precioUnitario) }
        : {}),
      ...(data.tipoRubro !== undefined ? { tipoRubro: data.tipoRubro } : {}),
      ...(data.tarifaImpuestoId !== undefined
        ? { tarifaImpuestoId: data.tarifaImpuestoId }
        : {}),
      ...(data.categoriaTarifaId !== undefined
        ? { categoriaTarifaId: data.categoriaTarifaId }
        : {}),
      ...(data.activo !== undefined ? { activo: data.activo } : {}),
      ...(data.esAutomatico !== undefined
        ? { esAutomatico: data.esAutomatico }
        : {}),
      ...(data.deletedAt !== undefined ? { deletedAt: data.deletedAt } : {}),
    };
  }

  static toPrismaWhereInput(where?: RubroFilters): Prisma.RubrosWhereInput {
    const base: Prisma.RubrosWhereInput = { deletedAt: null };
    if (!where) return base;

    return {
      ...base,
      ...(where.nombre
        ? { nombre: { contains: where.nombre.trim(), mode: 'insensitive' } }
        : {}),
      ...(where.tipoRubro ? { tipoRubro: where.tipoRubro } : {}),
      ...(where.tarifaImpuestoId !== undefined
        ? { tarifaImpuestoId: where.tarifaImpuestoId }
        : {}),
      ...((where as any).categoriaTarifaId !== undefined
        ? { categoriaTarifaId: (where as any).categoriaTarifaId }
        : {}),
      ...(where.activo !== undefined ? { activo: where.activo } : {}),
      ...(where.esAutomatico !== undefined
        ? { esAutomatico: where.esAutomatico }
        : {}),
    };
  }

  static toTarifaImpuestoInfo(
    raw: CatalogoTarifasImpuesto,
  ): TarifaImpuestoInfo {
    return {
      id: raw.id,
      impuestoId: raw.impuestoId,
      codigoPorcentaje: raw.codigoPorcentaje,
      descripcion: raw.descripcion,
      porcentaje:
        raw.porcentaje instanceof Decimal
          ? raw.porcentaje.toNumber()
          : Number(raw.porcentaje),
      activo: raw.activo,
    };
  }
}
