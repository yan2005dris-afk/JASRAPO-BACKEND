import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { CommunityRepository } from '../../domain/repositories/community.repository';
import { CommunityEntity } from '../../domain/entities/community.entity';
import { CommunityMapper } from '../mappers/community.mapper';
import type { CreateCommunityData } from '../../domain/types/create-community-data';

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

  async findUnique(
    where: Record<string, any>,
  ): Promise<CommunityEntity | null> {
    const record = await this.prisma.comunidades.findUnique({
      where: where as Prisma.ComunidadesWhereUniqueInput,
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record);
  }

  async findFirst(where: Record<string, any>): Promise<CommunityEntity | null> {
    const record = await this.prisma.comunidades.findFirst({
      where: where as Prisma.ComunidadesWhereInput,
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record);
  }

  async findMany(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<CommunityEntity[]> {
    const records = await this.prisma.comunidades.findMany({
      where: (params.where ?? {}) as Prisma.ComunidadesWhereInput,
      orderBy: params.orderBy as Prisma.ComunidadesOrderByWithRelationInput,
      skip: params.skip,
      take: params.take,
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomainList(records);
  }

  async count(params?: {
    where?: Record<string, any>;
  }): Promise<number> {
    return this.prisma.comunidades.count({
      where: (params?.where ?? {}) as Prisma.ComunidadesWhereInput,
    });
  }

  async create(data: CreateCommunityData): Promise<CommunityEntity> {
    const record = await this.prisma.comunidades.create({
      data: {
        nombre: data.nombre,
        codigo: data.codigo,
        porcentajeTasaSeguridad: data.porcentajeTasaSeguridad,
      },
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record)!;
  }

  async update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<CommunityEntity> {
    const record = await this.prisma.comunidades.update({
      where: where as Prisma.ComunidadesWhereUniqueInput,
      data: data as Prisma.ComunidadesUpdateInput,
      include: this.defaultInclude,
    });
    return CommunityMapper.toDomain(record)!;
  }
}
