import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { Decimal } from 'decimal.js';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
import { rubroInclude, type RubroRow } from './rubro.include';
import type {
  CreateRubroData,
  UpdateRubroData,
  RubroFilters,
  RubroFindManyParams,
  TarifaImpuestoInfo,
} from '../../domain/types/rubro.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaRubroRepository implements RubroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateRubroData): Promise<RubroRow> {
    try {
      return await this.prisma.rubros.create({
        data: this.toCreateInput(data),
        include: rubroInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'Rubro',
          'codigoSri',
          data.codigoSri ?? '',
        );
      }
      throw error;
    }
  }

  async findAll(params: RubroFindManyParams): Promise<RubroRow[]> {
    const where = this.toWhereInput(params.where);
    return this.prisma.rubros.findMany({
      where,
      include: rubroInclude,
      orderBy: params.orderBy ?? { rubroId: 'asc' },
      skip: params.skip,
      take: params.take,
    });
  }

  async count(params: { where?: RubroFilters }): Promise<number> {
    const where = this.toWhereInput(params.where);
    return this.prisma.rubros.count({ where });
  }

  async findById(id: number): Promise<RubroRow | null> {
    return this.prisma.rubros.findFirst({
      where: { rubroId: id, deletedAt: null },
      include: rubroInclude,
    });
  }

  async findByCategoriaTarifaId(
    categoriaTarifaId: number,
  ): Promise<RubroRow[]> {
    return this.prisma.rubros.findMany({
      where: { categoriaTarifaId, deletedAt: null },
      include: rubroInclude,
      orderBy: { rubroId: 'asc' },
    });
  }

  async findByCodigoSri(codigoSri: string): Promise<RubroRow | null> {
    return this.prisma.rubros.findFirst({
      where: { codigoSri, deletedAt: null },
      include: rubroInclude,
    });
  }

  async update(id: number, data: UpdateRubroData): Promise<RubroRow> {
    try {
      return await this.prisma.rubros.update({
        where: { rubroId: id },
        data: this.toUpdateInput(data),
        include: rubroInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Rubro', id);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'Rubro',
          'codigoSri',
          data.codigoSri ?? id.toString(),
        );
      }
      throw error;
    }
  }

  async delete(id: number): Promise<RubroRow> {
    try {
      return await this.prisma.rubros.update({
        where: { rubroId: id },
        data: {
          deletedAt: new Date(),
          activo: false,
        },
        include: rubroInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Rubro', id);
      }
      throw error;
    }
  }

  async countPrefacturaDetalleReferences(rubroId: number): Promise<number> {
    return this.prisma.prefacturaDetalle.count({
      where: {
        rubroId,
        deletedAt: null,
      },
    });
  }

  async findTarifasImpuesto(): Promise<TarifaImpuestoInfo[]> {
    const records = await this.prisma.catalogoTarifasImpuesto.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        id: 'asc',
      },
    });
    return records.map((r) => this.toTarifaImpuestoInfo(r));
  }

  /**
   * Helpers privados — antes vivian en `RubroMapper`. Se mantienen
   * como helpers privados del repo porque (a) son detalles de
   * adaptacion Prisma (Decimal <-> Prisma.Decimal, trim, defaults,
   * casts de enums) y (b) eliminan la ceremonia de un mapper 1:1 sin
   * perder capacidad.
   */

  private toCreateInput(
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

  private toUpdateInput(
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

  private toWhereInput(where?: RubroFilters): Prisma.RubrosWhereInput {
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

  private toTarifaImpuestoInfo(
    raw: Prisma.CatalogoTarifasImpuestoGetPayload<{}>,
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
