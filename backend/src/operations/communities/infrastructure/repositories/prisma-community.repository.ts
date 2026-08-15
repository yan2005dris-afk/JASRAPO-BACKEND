import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { CommunityMapper } from '../mappers/community.mapper';
import type { CreateCommunityData } from '../../domain/types/create-community-data';
import type { UpdateCommunityData } from '../../domain/types/update-community-data';
import type { CommunityFilters } from '../../domain/types/community-filters';
import {
  EntityNotFoundException,
  EntityAlreadyExistsException,
} from 'src/shared/domain/exceptions/domain.exception';

@Injectable()
export class PrismaCommunityRepository implements CommunityRepository {
  private readonly defaultInclude = {
    sector: {
      select: {
        sectorId: true,
        nombre: true,
        codigo: true,
      },
    },
  } satisfies Prisma.ComunidadesInclude;

  constructor(private readonly prisma: PrismaService) {}

  async findById(
    id: number,
    includeDeleted: boolean = false,
  ): Promise<CommunityEntity | null> {
    const record = await this.prisma.comunidades.findFirst({
      where: {
        comunidadId: id,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record);
  }

  async findByCodigo(codigo: string): Promise<CommunityEntity | null> {
    const record = await this.prisma.comunidades.findUnique({
      where: { codigo },
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record);
  }

  async findActiveByNameOrCode(
    nombre: string,
    codigo: string,
  ): Promise<CommunityEntity | null> {
    const record = await this.prisma.comunidades.findFirst({
      where: {
        deletedAt: null,
        OR: [{ nombre: { equals: nombre, mode: 'insensitive' } }, { codigo }],
      },
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record);
  }

  async paginate(
    filters: CommunityFilters,
    pagination: { skip: number; take: number },
  ): Promise<{ data: CommunityEntity[]; total: number }> {
    const where: Prisma.ComunidadesWhereInput = { deletedAt: null };
    if (filters.nombre) {
      where.nombre = { contains: filters.nombre, mode: 'insensitive' };
    }
    if (filters.codigo) {
      where.codigo = { contains: filters.codigo, mode: 'insensitive' };
    }

    const [records, total] = await Promise.all([
      this.prisma.comunidades.findMany({
        where,
        skip: pagination.skip,
        take: pagination.take,
        orderBy: { nombre: 'asc' },
        include: this.defaultInclude,
      }),
      this.prisma.comunidades.count({ where }),
    ]);

    return {
      data: CommunityMapper.toDomainList(records),
      total,
    };
  }

  async create(data: CreateCommunityData): Promise<CommunityEntity> {
    try {
      const record = await this.prisma.comunidades.create({
        data: {
          nombre: data.nombre,
          codigo: data.codigo,
          porcentajeTasaSeguridad: data.porcentajeTasaSeguridad,
        },
        include: this.defaultInclude,
      });
      return CommunityMapper.toDomain(record)!;
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

  async update(
    id: number,
    data: UpdateCommunityData,
  ): Promise<CommunityEntity> {
    try {
      const record = await this.prisma.comunidades.update({
        where: { comunidadId: id },
        data: {
          ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
          ...(data.codigo !== undefined ? { codigo: data.codigo } : {}),
          ...(data.porcentajeTasaSeguridad !== undefined
            ? { porcentajeTasaSeguridad: data.porcentajeTasaSeguridad }
            : {}),
        },
        include: this.defaultInclude,
      });
      return CommunityMapper.toDomain(record)!;
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
        throw new EntityAlreadyExistsException('Comunidad', data.codigo ?? id);
      }
      throw error;
    }
  }

  async reactivate(
    id: number,
    data: Partial<CreateCommunityData>,
  ): Promise<CommunityEntity> {
    const record = await this.prisma.comunidades.update({
      where: { comunidadId: id },
      data: {
        ...(data.nombre !== undefined ? { nombre: data.nombre } : {}),
        ...(data.porcentajeTasaSeguridad !== undefined
          ? { porcentajeTasaSeguridad: data.porcentajeTasaSeguridad }
          : {}),
        deletedAt: null,
      },
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record)!;
  }

  async softDelete(id: number): Promise<CommunityEntity> {
    try {
      const record = await this.prisma.comunidades.update({
        where: { comunidadId: id },
        data: { deletedAt: new Date() },
        include: this.defaultInclude,
      });
      return CommunityMapper.toDomain(record)!;
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
}
