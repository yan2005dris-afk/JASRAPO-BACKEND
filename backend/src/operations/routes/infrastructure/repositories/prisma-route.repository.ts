import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { RouteRepository } from '../../domain/repositories/route.repository';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';

@Injectable()
export class PrismaRouteRepository implements RouteRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: Prisma.RutasWhereUniqueInput): Promise<any> {
    return this.prisma.rutas.findUnique({ where });
  }

  async findMany(params: {
    where?: Prisma.RutasWhereInput;
    orderBy?: Prisma.RutasOrderByWithRelationInput;
    skip?: number;
    take?: number;
  }): Promise<any[]> {
    return this.prisma.rutas.findMany(params);
  }

  async paginateRutas(
    args: { where?: Prisma.RutasWhereInput; orderBy?: any },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<any>> {
    return paginate<any>(this.prisma.rutas, args, pagination);
  }

  async create(data: Prisma.RutasCreateInput): Promise<any> {
    return this.prisma.rutas.create({ data });
  }

  async update(
    where: Prisma.RutasWhereUniqueInput,
    data: Prisma.RutasUpdateInput,
  ): Promise<any> {
    return this.prisma.rutas.update({ where, data });
  }

  async findUsuario(
    where: Prisma.UsuariosWhereUniqueInput,
    options?: { include?: Prisma.UsuariosInclude },
  ): Promise<any> {
    return this.prisma.usuarios.findUnique({ where, ...options });
  }

  async findComunidad(where: Prisma.ComunidadesWhereUniqueInput): Promise<any> {
    return this.prisma.comunidades.findUnique({ where });
  }

  async findSector(where: Prisma.SectoresWhereUniqueInput): Promise<any> {
    return this.prisma.sectores.findUnique({ where });
  }

  async paginateLecturas(
    args: {
      where?: Prisma.LecturasWhereInput;
      include?: Prisma.LecturasInclude;
      orderBy?: any;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<any>> {
    return paginate<any>(this.prisma.lecturas, args, pagination);
  }
}
