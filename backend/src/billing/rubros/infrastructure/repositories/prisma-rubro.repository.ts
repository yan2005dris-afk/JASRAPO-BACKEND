import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { RubroEntity } from '../../domain/entities/rubro.entity';
import { RubroMapper } from '../mappers/rubro.mapper';
import { RubroRepository } from '../../domain/repositories/rubro.repository';
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

  async create(data: CreateRubroData): Promise<RubroEntity> {
    try {
      const prismaInput = RubroMapper.toPrismaCreateInput(data);
      const record = await this.prisma.rubros.create({
        data: prismaInput,
        include: {
          tarifaImpuesto: true,
        },
      });
      return RubroMapper.toDomain(record)!;
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

  async findAll(params: RubroFindManyParams): Promise<RubroEntity[]> {
    const where = RubroMapper.toPrismaWhereInput(params.where);
    const records = await this.prisma.rubros.findMany({
      where,
      include: {
        tarifaImpuesto: true,
      },
      orderBy: params.orderBy ?? { rubroId: 'asc' },
      skip: params.skip,
      take: params.take,
    });
    return RubroMapper.toDomainList(records);
  }

  async count(params: { where?: RubroFilters }): Promise<number> {
    const where = RubroMapper.toPrismaWhereInput(params.where);
    return this.prisma.rubros.count({ where });
  }

  async findById(id: number): Promise<RubroEntity | null> {
    const record = await this.prisma.rubros.findFirst({
      where: { rubroId: id, deletedAt: null },
      include: {
        tarifaImpuesto: true,
      },
    });
    return RubroMapper.toDomain(record);
  }

  async findByCodigoSri(codigoSri: string): Promise<RubroEntity | null> {
    const record = await this.prisma.rubros.findFirst({
      where: { codigoSri, deletedAt: null },
      include: {
        tarifaImpuesto: true,
      },
    });
    return RubroMapper.toDomain(record);
  }

  async update(id: number, data: UpdateRubroData): Promise<RubroEntity> {
    try {
      const prismaInput = RubroMapper.toPrismaUpdateInput(data);
      const record = await this.prisma.rubros.update({
        where: { rubroId: id },
        data: prismaInput,
        include: {
          tarifaImpuesto: true,
        },
      });
      return RubroMapper.toDomain(record)!;
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

  async delete(id: number): Promise<RubroEntity> {
    try {
      const record = await this.prisma.rubros.update({
        where: { rubroId: id },
        data: {
          deletedAt: new Date(),
          activo: false,
        },
        include: {
          tarifaImpuesto: true,
        },
      });
      return RubroMapper.toDomain(record)!;
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
    return records.map((r) => RubroMapper.toTarifaImpuestoInfo(r));
  }
}
