import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { communityInclude, type CommunityRow } from './community.include';
import type {
  CreateCommunityData,
  UpdateCommunityData,
  CommunityFilters,
} from '../../domain/types/community.types';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaCommunityRepository implements CommunityRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: number,
    includeDeleted: boolean = false,
  ): Promise<CommunityRow | null> {
    return this.prisma.comunidades.findFirst({
      where: {
        comunidadId: id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: communityInclude,
    });
  }

  async findByCodigo(codigo: string): Promise<CommunityRow | null> {
    return this.prisma.comunidades.findUnique({
      where: { codigo },
      include: communityInclude,
    });
  }

  async findActiveByNameOrCode(
    nombre: string,
    codigo: string,
  ): Promise<CommunityRow | null> {
    return this.prisma.comunidades.findFirst({
      where: {
        deletedAt: null,
        OR: [{ nombre: { equals: nombre, mode: 'insensitive' } }, { codigo }],
      },
      include: communityInclude,
    });
  }

  async paginate(
    filters: CommunityFilters,
    pagination: { skip: number; take: number },
  ): Promise<{ data: CommunityRow[]; total: number }> {
    const where: Prisma.ComunidadesWhereInput = { deletedAt: null };
    if (filters.nombre) {
      where.nombre = { contains: filters.nombre, mode: 'insensitive' };
    }
    if (filters.codigo) {
      where.codigo = { contains: filters.codigo, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.comunidades.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { nombre: 'asc' },
        include: communityInclude,
      }),
      this.prisma.comunidades.count({ where }),
    ]);

    return { data, total };
  }

  async create(data: CreateCommunityData): Promise<CommunityRow> {
    try {
      return await this.prisma.comunidades.create({
        data: this.toCreateInput(data),
        include: communityInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('Comunidad', data.codigo);
      }
      throw error;
    }
  }

  async update(id: number, data: UpdateCommunityData): Promise<CommunityRow> {
    try {
      return await this.prisma.comunidades.update({
        where: { comunidadId: id },
        data: this.toUpdateInput(data),
        include: communityInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Comunidad', id);
      }
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException(
          'Comunidad',
          data.codigo ?? id.toString(),
        );
      }
      throw error;
    }
  }

  async reactivate(
    id: number,
    data: Partial<CreateCommunityData>,
  ): Promise<CommunityRow> {
    const updateData: Prisma.ComunidadesUncheckedUpdateInput = {
      deletedAt: null,
    };
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (
      data.porcentajeTasaSeguridad !== undefined &&
      data.porcentajeTasaSeguridad !== null
    ) {
      updateData.porcentajeTasaSeguridad = new Prisma.Decimal(
        data.porcentajeTasaSeguridad,
      );
    }

    return this.prisma.comunidades.update({
      where: { comunidadId: id },
      data: updateData,
      include: communityInclude,
    });
  }

  async softDelete(id: number): Promise<CommunityRow> {
    try {
      return await this.prisma.comunidades.update({
        where: { comunidadId: id },
        data: { deletedAt: new Date() },
        include: communityInclude,
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException('Comunidad', id);
      }
      throw error;
    }
  }

  /**
   * Helpers privados — antes vivian en `CommunityMapper`. Se mantienen
   * como helpers privados del repo porque (a) son detalles de
   * adaptacion Prisma (coercion Decimal -> number, defaults) y
   * (b) eliminan la ceremonia de un mapper 1:1 sin perder capacidad.
   */

  private toCreateInput(
    data: CreateCommunityData,
  ): Prisma.ComunidadesUncheckedCreateInput {
    return {
      nombre: data.nombre,
      codigo: data.codigo,
      porcentajeTasaSeguridad:
        data.porcentajeTasaSeguridad !== undefined &&
        data.porcentajeTasaSeguridad !== null
          ? new Prisma.Decimal(data.porcentajeTasaSeguridad)
          : new Prisma.Decimal(0),
    };
  }

  private toUpdateInput(
    data: UpdateCommunityData,
  ): Prisma.ComunidadesUncheckedUpdateInput {
    const input: Prisma.ComunidadesUncheckedUpdateInput = {};
    if (data.nombre !== undefined) input.nombre = data.nombre;
    if (data.codigo !== undefined) input.codigo = data.codigo;
    if (
      data.porcentajeTasaSeguridad !== undefined &&
      data.porcentajeTasaSeguridad !== null
    ) {
      input.porcentajeTasaSeguridad = new Prisma.Decimal(
        data.porcentajeTasaSeguridad,
      );
    }
    return input;
  }
}
