import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
} from 'src/shared/domain/exceptions/domain.exception';
import { ClientRepository } from '../../domain/repositories/client.repository';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import { ClientEntity } from '../../domain/entities/client.entity';
import { ClientMapper } from '../mappers/client.mapper';
import type {
  CreateClientData,
  UpdateClientData,
  ClientFilters,
  IdentificationTypeRef,
  ConsumidorFinalData,
} from '../../domain/types/client.types';

/** CONSUMIDOR_FINAL id in `catalogo_tipos_identificacion` */
const CONSUMIDOR_FINAL_TIPO_ID = 4;
/** Fixed identification/naming for the CONSUMIDOR_FINAL singleton */
const CONSUMIDOR_FINAL_IDENTIFICACION = '9999999999999';

@Injectable()
export class PrismaClientRepository implements ClientRepository {
  /** Include object to always fetch the tipoIdentificacion relation */
  private readonly defaultInclude = {
    tipoIdentificacion: true,
  } satisfies Prisma.ClientesInclude;

  constructor(private readonly prisma: PrismaService) {}

  async findById(id: bigint): Promise<ClientEntity | null> {
    const record = await this.prisma.clientes.findFirst({
      where: { clienteId: id, deletedAt: null },
      include: this.defaultInclude,
    });
    return ClientMapper.toDomain(record);
  }

  async findByIdentificacion(
    identificacion: string,
  ): Promise<ClientEntity | null> {
    const record = await this.prisma.clientes.findUnique({
      where: { identificacion },
      include: this.defaultInclude,
    });
    return ClientMapper.toDomain(record);
  }

  async create(data: CreateClientData): Promise<ClientEntity> {
    try {
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
    } catch (error) {
      if (this.isUniqueViolation(error)) {
        throw new EntityAlreadyExistsException(
          'Cliente',
          'identificacion',
          data.identificacion,
        );
      }
      throw error;
    }
  }

  async updateClient(
    id: bigint,
    data: UpdateClientData,
  ): Promise<ClientEntity> {
    const updateData: Prisma.ClientesUpdateInput = {};

    if (data.tipoIdentificacionId !== undefined) {
      updateData.tipoIdentificacion = {
        connect: { id: data.tipoIdentificacionId },
      };
    }
    if (data.identificacion !== undefined)
      updateData.identificacion = data.identificacion;
    if (data.nombres !== undefined) updateData.nombres = data.nombres;
    if (data.apellidos !== undefined) updateData.apellidos = data.apellidos;
    if (data.razonSocial !== undefined)
      updateData.razonSocial = data.razonSocial;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.telefono !== undefined) updateData.telefono = data.telefono;
    if (data.telefonoSecundario !== undefined)
      updateData.telefonoSecundario = data.telefonoSecundario;
    if (data.direccionDomicilio !== undefined)
      updateData.direccionDomicilio = data.direccionDomicilio;
    if (data.aplicaTerceraEdad !== undefined)
      updateData.aplicaTerceraEdad = data.aplicaTerceraEdad;
    if (data.aplicaDiscapacidad !== undefined)
      updateData.aplicaDiscapacidad = data.aplicaDiscapacidad;
    if (data.deletedAt !== undefined) updateData.deletedAt = data.deletedAt;

    try {
      const record = await this.prisma.clientes.update({
        where: { clienteId: id },
        data: updateData,
        include: this.defaultInclude,
      });
      return ClientMapper.toDomain(record)!;
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw new EntityNotFoundException('Cliente', id);
      }
      throw error;
    }
  }

  async softDelete(id: bigint): Promise<ClientEntity> {
    try {
      const record = await this.prisma.clientes.update({
        where: { clienteId: id },
        data: { deletedAt: new Date() },
        include: this.defaultInclude,
      });
      return ClientMapper.toDomain(record)!;
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw new EntityNotFoundException('Cliente', id);
      }
      throw error;
    }
  }

  async findTipoIdentificacionById(
    id: number,
  ): Promise<IdentificationTypeRef | null> {
    return this.prisma.catalogoTiposIdentificacion.findUnique({
      where: { id },
      select: { id: true, codigo: true, descripcion: true, activo: true },
    });
  }

  async findActiveTipoIdentificaciones(): Promise<IdentificationTypeRef[]> {
    return this.prisma.catalogoTiposIdentificacion.findMany({
      where: { activo: true },
      orderBy: { id: 'asc' },
      select: { id: true, codigo: true, descripcion: true, activo: true },
    });
  }

  /**
   * Enforce the single-active CONSUMIDOR_FINAL invariant atomically:
   * create the singleton when none exists, reactivate a soft-deleted principal
   * (refreshing its contact data), and soft-delete any extra records.
   */
  async reactivateOrCreateConsumidorFinal(
    data: ConsumidorFinalData,
  ): Promise<ClientEntity> {
    const record = await this.prisma.$transaction(async (tx) => {
      const consumidores = await tx.clientes.findMany({
        where: { tipoIdentificacionId: CONSUMIDOR_FINAL_TIPO_ID },
        orderBy: { createdAt: 'asc' },
      });

      const principal = consumidores[0];

      if (principal) {
        if (consumidores.length > 1) {
          await tx.clientes.updateMany({
            where: {
              clienteId: {
                in: consumidores.slice(1).map((c) => c.clienteId),
              },
            },
            data: { deletedAt: new Date() },
          });
        }

        return tx.clientes.update({
          where: { clienteId: principal.clienteId },
          data: {
            identificacion: CONSUMIDOR_FINAL_IDENTIFICACION,
            nombres: 'CONSUMIDOR',
            apellidos: 'FINAL',
            razonSocial: 'CONSUMIDOR FINAL',
            email: data.email,
            telefono: data.telefono,
            telefonoSecundario: data.telefonoSecundario,
            direccionDomicilio: data.direccionDomicilio,
            aplicaTerceraEdad: false,
            aplicaDiscapacidad: false,
            deletedAt: null,
          },
          include: this.defaultInclude,
        });
      }

      return tx.clientes.create({
        data: {
          identificacion: CONSUMIDOR_FINAL_IDENTIFICACION,
          tipoIdentificacion: {
            connect: { id: CONSUMIDOR_FINAL_TIPO_ID },
          },
          nombres: 'CONSUMIDOR',
          apellidos: 'FINAL',
          razonSocial: 'CONSUMIDOR FINAL',
          email: data.email,
          telefono: data.telefono,
          telefonoSecundario: data.telefonoSecundario,
          direccionDomicilio: data.direccionDomicilio,
          aplicaTerceraEdad: false,
          aplicaDiscapacidad: false,
        },
        include: this.defaultInclude,
      });
    });

    return ClientMapper.toDomain(record)!;
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

  /** Detects Prisma unique-constraint violations (e.g. duplicate identification). */
  private isUniqueViolation(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    );
  }

  /** Detects Prisma P2025 (record not found). */
  private isRecordNotFound(
    error: unknown,
  ): error is Prisma.PrismaClientKnownRequestError {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2025'
    );
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
      return conditions.length === 1 ? conditions[0] : { AND: conditions };
    }

    if (filters.identificacion) {
      conditions.push({
        identificacion: {
          contains: filters.identificacion,
          mode: 'insensitive',
        },
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
          {
            nombres: { contains: filters.nombreCompleto, mode: 'insensitive' },
          },
          {
            apellidos: {
              contains: filters.nombreCompleto,
              mode: 'insensitive',
            },
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
