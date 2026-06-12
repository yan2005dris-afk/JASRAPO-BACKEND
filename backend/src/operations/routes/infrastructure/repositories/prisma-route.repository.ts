import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma, EstadoRuta, TipoRuta } from 'src/generated/prisma/client';
import {
  RouteRepository,
  UsuarioRef,
  ComunidadRef,
  SectorRef,
} from '../../domain/repositories/route.repository';
import { RouteEntity } from '../../domain/entities/route.entity';
import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';
import { RouteMapper } from '../mappers/route.mapper';
import { ReadingForRouteMapper } from '../mappers/reading-for-route.mapper';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { CreateRouteData } from '../../domain/types/create-route-data';

@Injectable()
export class PrismaRouteRepository implements RouteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: Record<string, any>): Promise<any> {
    return this.prisma.rutas.findUnique({
      where: where as Prisma.RutasWhereUniqueInput,
    });
  }

  async findMany(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]> {
    return this.prisma.rutas.findMany({
      where: params.where as Prisma.RutasWhereInput,
      orderBy: params.orderBy as Prisma.RutasOrderByWithRelationInput,
      skip: params.skip,
      take: params.take,
    });
  }

  async paginateRutas(
    args: { where?: Record<string, any>; orderBy?: Record<string, any> },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<RouteEntity>> {
    const result = await paginate<any>(
      this.prisma.rutas,
      {
        where: args.where as Prisma.RutasWhereInput,
        orderBy: args.orderBy as Prisma.RutasOrderByWithRelationInput,
      },
      pagination,
    );

    return {
      data: result.data.map((r) => RouteMapper.toEntity(r)),
      meta: result.meta,
    };
  }

  async create(data: CreateRouteData): Promise<any> {
    return this.prisma.rutas.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        operario: { connect: { usuarioId: data.operarioId } },
        tipoRuta: data.tipoRuta as TipoRuta,
        comunidad: { connect: { comunidadId: data.comunidadId } },
        sector: data.sectorId ? { connect: { sectorId: data.sectorId } } : undefined,
        fechaPlanificada: data.fechaPlanificada ?? null,
        estado: (data.estado ?? 'PENDIENTE') as EstadoRuta,
      },
    });
  }

  async update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<any> {
    return this.prisma.rutas.update({
      where: where as Prisma.RutasWhereUniqueInput,
      data: data as Prisma.RutasUpdateInput,
    });
  }

  async findUsuario(
    where: { usuarioId: number },
    options?: { include?: Record<string, any> },
  ): Promise<UsuarioRef | null> {
    return this.prisma.usuarios.findUnique({
      where: { usuarioId: where.usuarioId },
      ...(options?.include && {
        include: options.include as Prisma.UsuariosInclude,
      }),
    }) as Promise<UsuarioRef | null>;
  }

  async findComunidad(
    where: { comunidadId: number },
  ): Promise<ComunidadRef | null> {
    return this.prisma.comunidades.findUnique({
      where: { comunidadId: where.comunidadId },
    }) as Promise<ComunidadRef | null>;
  }

  async findSector(
    where: { sectorId: number },
  ): Promise<SectorRef | null> {
    return this.prisma.sectores.findUnique({
      where: { sectorId: where.sectorId },
    }) as Promise<SectorRef | null>;
  }

  async paginateLecturas(
    args: {
      where?: Record<string, any>;
      orderBy?: any;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ReadingForRouteEntity>> {
    const result = await paginate<any>(
      this.prisma.lecturas,
      {
        where: args.where as Prisma.LecturasWhereInput,
        include: {
          medidor: {
            include: {
              historial: {
                where: { fechaHasta: null },
                include: {
                  contrato: { include: { cliente: true, sector: true } },
                },
              },
            },
          },
        } satisfies Prisma.LecturasInclude,
        orderBy: args.orderBy,
      },
      pagination,
    );

    return {
      data: result.data.map((l) => ReadingForRouteMapper.toEntity(l)),
      meta: result.meta,
    };
  }
}
