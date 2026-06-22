import type {
  CatalogoDescuento,
  TipoDescuento,
  Prisma,
} from 'src/generated/prisma/client';
import { DiscountEntity } from '../../domain/entities/discount.entity';
import type {
  DiscountCreateInput,
  DiscountUpdateInput,
  DiscountWhereInput,
} from '../../domain/repositories/discount.repository';
import { Decimal } from 'decimal.js';

export class DiscountMapper {
  static toDomain(raw: CatalogoDescuento): DiscountEntity {
    return new DiscountEntity({
      id: raw.id,
      nombre: raw.nombre,
      descripcion: raw.descripcion,
      tipoDescuento: raw.tipoDescuento,
      valor:
        raw.valor instanceof Decimal ? raw.valor.toNumber() : Number(raw.valor),
      esPorcentaje: raw.esPorcentaje,
      rubroId: raw.rubroId,
      activo: raw.activo,
      aplicaAutomatico: raw.aplicaAutomatico,
    });
  }

  static toDomainList(rawList: CatalogoDescuento[]): DiscountEntity[] {
    return rawList.map((raw) => this.toDomain(raw));
  }

  static toPrismaCreateInput(
    data: DiscountCreateInput,
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
    data: DiscountUpdateInput,
  ): Prisma.CatalogoDescuentoUncheckedUpdateInput {
    return {
      nombre: data.nombre,
      descripcion: data.descripcion,
      tipoDescuento: data.tipoDescuento
        ? (data.tipoDescuento as TipoDescuento)
        : undefined,
      valor: data.valor !== undefined ? new Decimal(data.valor) : undefined,
      esPorcentaje: data.esPorcentaje,
      rubroId: data.rubroId,
      aplicaAutomatico: data.aplicaAutomatico,
      activo: data.activo,
    };
  }

  static toPrismaWhereInput(
    where?: DiscountWhereInput,
  ): Prisma.CatalogoDescuentoWhereInput {
    if (!where) return {};
    return {
      activo: where.activo,
      tipoDescuento: where.tipoDescuento
        ? (where.tipoDescuento as TipoDescuento)
        : undefined,
      aplicaAutomatico: where.aplicaAutomatico,
    };
  }
}
