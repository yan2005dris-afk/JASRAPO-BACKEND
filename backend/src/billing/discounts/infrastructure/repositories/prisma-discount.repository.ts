import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, TipoDescuento } from 'src/generated/prisma/client';
import { Decimal } from 'decimal.js';
import { DiscountRepository } from '../../domain/repositories/discount.repository';
import { discountInclude, type DiscountRow } from './discount.include';
import type {
  CreateDiscountData,
  UpdateDiscountData,
  DiscountFilters,
  DiscountFindManyParams,
} from '../../domain/types/discount.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaDiscountRepository implements DiscountRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCatalogo(data: CreateDiscountData): Promise<DiscountRow> {
    try {
      return await this.prisma.catalogoDescuento.create({
        data: this.toCreateInput(data),
        include: discountInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'CatalogoDescuento',
          data.nombre,
        );
      }
      throw error;
    }
  }

  async findManyCatalogo(
    params: DiscountFindManyParams,
  ): Promise<DiscountRow[]> {
    const where = this.toWhereInput(params.where);
    return this.prisma.catalogoDescuento.findMany({
      where,
      include: discountInclude,
      orderBy:
        params.orderBy as Prisma.CatalogoDescuentoOrderByWithRelationInput,
      skip: params.skip,
      take: params.take,
    });
  }

  async countCatalogo(params: { where?: DiscountFilters }): Promise<number> {
    const where = this.toWhereInput(params.where);
    return this.prisma.catalogoDescuento.count({ where });
  }

  async findUniqueCatalogo(id: number): Promise<DiscountRow | null> {
    return this.prisma.catalogoDescuento.findUnique({
      where: { id },
      include: discountInclude,
    });
  }

  async updateCatalogo(
    id: number,
    data: UpdateDiscountData,
  ): Promise<DiscountRow> {
    try {
      return await this.prisma.catalogoDescuento.update({
        where: { id },
        data: this.toUpdateInput(data),
        include: discountInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('CatalogoDescuento', id);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'CatalogoDescuento',
          data.nombre ?? id.toString(),
        );
      }
      throw error;
    }
  }

  async findRubros(): Promise<
    Array<{
      rubroId: number;
      nombre: string;
      tipoRubro: string;
      precioUnitario: number;
    }>
  > {
    const records = await this.prisma.rubros.findMany({
      where: { activo: true, deletedAt: null },
      select: {
        rubroId: true,
        nombre: true,
        tipoRubro: true,
        precioUnitario: true,
      },
      orderBy: { nombre: 'asc' },
    });
    return records.map((r) => ({
      rubroId: r.rubroId,
      nombre: r.nombre,
      tipoRubro: r.tipoRubro,
      precioUnitario: Number(r.precioUnitario),
    }));
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  /**
   * Helpers privados — antes vivian en `DiscountMapper`. Se mantienen
   * como helpers privados del repo porque (a) son detalles de
   * adaptacion Prisma (Decimal -> Prisma.Decimal, casts de enums) y
   * (b) eliminan la ceremonia de un mapper 1:1 sin perder capacidad.
   */

  private toCreateInput(
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

  private toUpdateInput(
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

  private toWhereInput(
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
