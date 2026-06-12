import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ClientRepository } from '../../domain/repositories/client.repository';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ClientEntity } from '../../domain/entities/client.entity';
import { ClientMapper } from '../mappers/client.mapper';
import type { CreateClientData } from '../../domain/types/create-client-data';
import type { ClientFilters } from '../../domain/types/client-filters';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  /** Include object to always fetch the tipoIdentificacion relation */
  private readonly defaultInclude = {
    tipoIdentificacion: true,
  } satisfies Prisma.ClientesInclude;

  constructor(private readonly prisma: PrismaService) {}

  async findFirst(where: Record<string, any>): Promise<ClientEntity | null> {
    const record = await this.prisma.clientes.findFirst({
      where: where as Prisma.ClientesWhereInput,
      include: this.defaultInclude,
    });
    return ClientMapper.toDomain(record);
  }

  async findUnique(where: Record<string, any>): Promise<any> {
    return this.prisma.clientes.findUnique({
      where: where as Prisma.ClientesWhereUniqueInput,
    });
  }

  async findMany(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<ClientEntity[]> {
    const records = await this.prisma.clientes.findMany({
      where: (params.where ?? {}) as Prisma.ClientesWhereInput,
      orderBy: params.orderBy as Prisma.ClientesOrderByWithRelationInput,
      include: this.defaultInclude,
    });
    return ClientMapper.toDomainList(records);
  }

  async create(data: CreateClientData): Promise<ClientEntity> {
    const record = await this.prisma.clientes.create({
      data: {
        identificacion: data.identificacion,
        tipoIdentificacion: {
          connect: { id: data.tipoIdentificacionId },
        },
        nombres: data.nombres,
        apellidos: data.apellidos,
        razonSocial: data.razonSocial,
        email: data.email,
        telefono: data.telefono,
        telefonoSecundario: data.telefonoSecundario,
        direccionDomicilio: data.direccionDomicilio,
        aplicaTerceraEdad: data.aplicaTerceraEdad,
        aplicaDiscapacidad: data.aplicaDiscapacidad,
      },
      include: this.defaultInclude,
    });
    return ClientMapper.toDomain(record)!;
  }

  async update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<any> {
    return this.prisma.clientes.update({
      where: where as Prisma.ClientesWhereUniqueInput,
      data: data as Prisma.ClientesUpdateInput,
      include: this.defaultInclude,
    });
  }

  async updateMany(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<any> {
    return this.prisma.clientes.updateMany({
      where: where as Prisma.ClientesWhereInput,
      data: data as Prisma.ClientesUpdateManyMutationInput,
    });
  }

  async findCatalogoTipoIdentificacion(where: {
    id: number;
  }): Promise<{
    id: number;
    codigo: string;
    descripcion: string;
    activo: boolean;
  } | null> {
    return this.prisma.catalogoTiposIdentificacion.findUnique({
      where: { id: where.id },
      select: { id: true, codigo: true, descripcion: true, activo: true },
    }) as Promise<{
      id: number;
      codigo: string;
      descripcion: string;
      activo: boolean;
    } | null>;
  }

  async findManyCatalogoTipoIdentificacion(params: {
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<any[]> {
    return this.prisma.catalogoTiposIdentificacion.findMany({
      where: params.where as Prisma.CatalogoTiposIdentificacionWhereInput,
      orderBy:
        params.orderBy as Prisma.CatalogoTiposIdentificacionOrderByWithRelationInput,
    });
  }

  async paginateClientes(
    args: {
      filters?: ClientFilters;
      orderBy?: Record<string, any>;
    },
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<ClientEntity>> {
    const where = this.buildClientWhere(args.filters);

    const result = await paginate<any>(
      this.prisma.clientes,
      {
        where,
        orderBy: args.orderBy as Prisma.ClientesOrderByWithRelationInput,
        include: this.defaultInclude,
      },
      pagination,
    );

    return {
      data: ClientMapper.toDomainList(result.data),
      meta: result.meta,
    };
  }

  /**
   * Builds a Prisma where clause from domain ClientFilters.
   * Inlines the logic previously in domain/types/clientFilters.ts
   * to keep Prisma-specific types inside the infrastructure layer.
   */
  private buildClientWhere(filters?: ClientFilters): Prisma.ClientesWhereInput {
    const conditions: Prisma.ClientesWhereInput[] = [];

    // Always exclude soft-deleted records
    conditions.push({ deletedAt: null });

    if (!filters) {
      return conditions.length === 1
        ? conditions[0]
        : { AND: conditions };
    }

    if (filters.identificacion) {
      conditions.push({
        identificacion: { contains: filters.identificacion, mode: 'insensitive' },
      });
    }

    if (filters.nombres) {
      conditions.push({
        nombres: { contains: filters.nombres, mode: 'insensitive' },
      });
    }

    if (filters.apellidos) {
      conditions.push({
        apellidos: { contains: filters.apellidos, mode: 'insensitive' },
      });
    }

    if (filters.nombreCompleto) {
      conditions.push({
        OR: [
          { nombres: { contains: filters.nombreCompleto, mode: 'insensitive' } },
          {
            apellidos: { contains: filters.nombreCompleto, mode: 'insensitive' },
          },
        ],
      });
    }

    if (filters.activo !== undefined) {
      conditions.push({ activo: filters.activo });
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }
}
