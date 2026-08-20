import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EstadoOrdenTrabajo } from 'src/shared/enums';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import { OrdenTrabajoMapper } from '../mappers/orden-trabajo.mapper';
import {
  paginate,
  PaginateOptions,
} from 'src/infrastructure/common/utils/pagination.util';
import { PaginatedResult } from 'src/infrastructure/common/types/paginated-result.type';
import type { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import type {
  OrdenTrabajoFilters,
  UpdateOrdenEstadoData,
  LinkLecturaData,
} from '../../domain/types/orden-trabajo.types';
import { EntityNotFoundException } from 'src/shared/domain/exceptions/domain.exception';

interface OrdenTrabajoPrismaResult {
  ordenTrabajoId: bigint;
  rutaId: bigint;
  contratoId: bigint;
  medidorId: bigint | null;
  tipoActividad: string;
  estado: string;
  ordenVisita: number;
  resultadoObservacion: string | null;
  evidenciaFotoUrl: string | null;
  completadoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lecturaId: bigint | null;

  contrato: {
    numeroGuia: string;
    direccionSuministro: string;
    cliente: {
      nombres: string;
      apellidos: string;
    } | null;
  } | null;
  medidor: {
    serie: string;
  } | null;
  lectura: {
    lecturaId: bigint;
  } | null;
}

@Injectable()
export class PrismaOrdenTrabajoRepository implements OrdenTrabajoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(
    ordenTrabajoId: bigint,
    includeDeleted: boolean = false,
  ): Promise<OrdenTrabajoEntity | null> {
    const raw = await this.prisma.ordenesTrabajo.findFirst({
      where: {
        ordenTrabajoId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
    return raw ? OrdenTrabajoMapper.toEntity(raw) : null;
  }

  async findByRutaId(
    rutaId: bigint,
    filters: OrdenTrabajoFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<OrdenTrabajoEntity>> {
    const where: Prisma.OrdenesTrabajoWhereInput = {
      rutaId,
      deletedAt: null,
      ...(filters.estado
        ? { estado: filters.estado as EstadoOrdenTrabajo }
        : {}),
    };

    const result = await paginate<OrdenTrabajoPrismaResult>(
      this.prisma.ordenesTrabajo,
      {
        where,
        include: {
          contrato: {
            select: {
              numeroGuia: true,
              direccionSuministro: true,
              cliente: {
                select: {
                  nombres: true,
                  apellidos: true,
                },
              },
            },
          },
          medidor: {
            select: {
              serie: true,
            },
          },
          lectura: {
            select: {
              lecturaId: true,
            },
          },
        },
        orderBy: { ordenVisita: 'asc' },
      },
      pagination,
    );

    const data = result.data.map((raw) =>
      OrdenTrabajoMapper.toEntity({
        ordenTrabajoId: raw.ordenTrabajoId,
        rutaId: raw.rutaId,
        contratoId: raw.contratoId,
        medidorId: raw.medidorId,
        tipoActividad: raw.tipoActividad,
        estado: raw.estado,
        ordenVisita: raw.ordenVisita,
        resultadoObservacion: raw.resultadoObservacion,
        evidenciaFotoUrl: raw.evidenciaFotoUrl,
        completadoEn: raw.completadoEn,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        deletedAt: raw.deletedAt,
        lecturaId: raw.lecturaId,

        contratoNumeroContrato: raw.contrato?.numeroGuia ?? null,
        contratoClienteNombre: raw.contrato?.cliente
          ? `${raw.contrato.cliente.nombres} ${raw.contrato.cliente.apellidos}`.trim()
          : null,
        contratoDireccion: raw.contrato?.direccionSuministro ?? null,
        medidorNumeroSerie: raw.medidor?.serie ?? null,
        lecturaLecturaId: raw.lectura?.lecturaId ?? null,
      }),
    );

    return {
      data,
      meta: result.meta,
    };
  }

  async updateEstado(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
  ): Promise<OrdenTrabajoEntity> {
    try {
      const current = await this.prisma.ordenesTrabajo.findUnique({
        where: { ordenTrabajoId },
      });

      if (!current) {
        throw new EntityNotFoundException(
          'Orden de Trabajo',
          ordenTrabajoId.toString(),
        );
      }

      const isCompleting =
        data.estado === EstadoOrdenTrabajo.COMPLETADA ||
        data.estado === EstadoOrdenTrabajo.FALLIDA ||
        data.estado === EstadoOrdenTrabajo.CANCELADA;

      const isReopening =
        data.estado === EstadoOrdenTrabajo.PENDIENTE ||
        data.estado === EstadoOrdenTrabajo.EN_PROGRESO;

      const raw = await this.prisma.ordenesTrabajo.update({
        where: { ordenTrabajoId },
        data: {
          estado: data.estado as EstadoOrdenTrabajo,
          ...(data.resultadoObservacion !== undefined
            ? { resultadoObservacion: data.resultadoObservacion }
            : {}),
          ...(isCompleting && !current.completadoEn
            ? { completadoEn: new Date() }
            : {}),
          ...(isReopening ? { completadoEn: null } : {}),
        },
      });

      return OrdenTrabajoMapper.toEntity(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException(
          'Orden de Trabajo',
          ordenTrabajoId.toString(),
        );
      }
      throw error;
    }
  }

  async linkLectura(
    ordenTrabajoId: bigint,
    data: LinkLecturaData,
  ): Promise<OrdenTrabajoEntity> {
    try {
      const orden = await this.prisma.ordenesTrabajo.findUnique({
        where: { ordenTrabajoId },
      });

      if (!orden) {
        throw new EntityNotFoundException(
          'Orden de Trabajo',
          ordenTrabajoId.toString(),
        );
      }

      const lectura = await this.prisma.lecturas.findUnique({
        where: { lecturaId: data.lecturaId },
      });

      if (!lectura) {
        throw new EntityNotFoundException('Lectura', data.lecturaId.toString());
      }

      const raw = await this.prisma.ordenesTrabajo.update({
        where: { ordenTrabajoId },
        data: {
          lecturaId: data.lecturaId,
          estado: EstadoOrdenTrabajo.COMPLETADA,
          completadoEn: orden.completadoEn ?? new Date(),
        },
      });

      return OrdenTrabajoMapper.toEntity(raw);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2025'
      ) {
        throw new EntityNotFoundException(
          'Orden de Trabajo',
          ordenTrabajoId.toString(),
        );
      }
      throw error;
    }
  }

  async findLecturaById(lecturaId: bigint): Promise<any> {
    return this.prisma.lecturas.findUnique({
      where: { lecturaId },
    });
  }
}
