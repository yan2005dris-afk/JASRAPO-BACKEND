import type {
  CatalogoDescuento,
  TipoDescuento,
  Prisma,
} from 'src/generated/prisma/client';
import { DiscountEntity } from '../../domain/entities/discount.entity';
import type {
  CreateDiscountData,
  UpdateDiscountData,
  DiscountFilters,
} from '../../domain/types/discount.types';
import { Decimal } from 'decimal.js';

export class DiscountMapper {
  static toDomain(
    raw: (CatalogoDescuento & { rubro?: any }) | null | undefined,
  ): DiscountEntity | null {
    if (!raw) return null;
    return new DiscountEntity({
      id: raw.id,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      tipoDescuento: raw.tipoDescuento,
      valor:
        raw.valor instanceof Decimal ? raw.valor.toNumber() : Number(raw.valor),
      esPorcentaje: raw.esPorcentaje,
      rubroId: raw.rubroId,
      rubro: raw.rubro
        ? {
            rubroId: raw.rubro.rubroId,
            nombre: raw.rubro.nombre,
            tipoRubro: raw.rubro.tipoRubro,
            precioUnitario: raw.rubro.precioUnitario,
          }
        : null,
      activo: raw.activo,
      aplicaAutomatico: raw.aplicaAutomatico,
    });
  }

  static toDomainList(
    rawList: Array<CatalogoDescuento & { rubro?: any }>,
  ): DiscountEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((e): e is DiscountEntity => e !== null);
  }

  static toPrismaCreateInput(
    data: CreateDiscountData,
  ): Prisma.CatalogoDescuentoUncheckedCreateInput {
    return {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoDescuento: data.tipoDescuento as TipoDescuento,
      valor: new Decimal(data.valor),
      esPorcentaje: data.esPorcentaje,
      rubroId: data.rubroId,
      aplicaAutomatico: data.aplicaAutomatico,
    };
  }

  static toPrismaUpdateInput(
    data: UpdateDiscountData,
  ): Prisma.CatalogoDescuentoUncheckedUpdateInput {
    return {
      ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
      ...(data.descripcion !== undefined
        ? { descripcion: data.descripcion }
        : {}),
      ...(data.tipoDescuento !== undefined
        ? { tipoDescuento: data.tipoDescuento as TipoDescuento }
        : {}),
      ...(data.valor !== undefined ? { valor: new Decimal(data.valor) } : {}),
      ...(data.esPorcentaje !== undefined
        ? { esPorcentaje: data.esPorcentaje }
        : {}),
      ...(data.rubroId !== undefined ? { rubroId: data.rubroId } : {}),
      ...(data.aplicaAutomatico !== undefined
        ? { aplicaAutomatico: data.aplicaAutomatico }
        : {}),
      ...(data.activo !== undefined ? { activo: data.activo } : {}),
    };
  }

  static toPrismaWhereInput(
    where?: DiscountFilters,
  ): Prisma.CatalogoDescuentoWhereInput {
    if (!where) return {};
    return {
      ...(where.activo !== undefined ? { activo: where.activo } : {}),
      ...(where.tipoDescuento
        ? { tipoDescuento: where.tipoDescuento as TipoDescuento }
        : {}),
      ...(where.aplicaAutomatico !== undefined
        ? { aplicaAutomatico: where.aplicaAutomatico }
        : {}),
    };
  }
}
