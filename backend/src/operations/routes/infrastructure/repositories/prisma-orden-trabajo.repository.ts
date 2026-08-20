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
  OrdenTrabajoKpis,
  UpdateOrdenEstadoData,
  LinkLecturaData,
} from '../../domain/types/orden-trabajo.types';
import {
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';

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
  ): Promise<PaginatedResult<OrdenTrabajoEntity, OrdenTrabajoKpis>> {
    const where: Prisma.OrdenesTrabajoWhereInput = {
      rutaId,
      deletedAt: null,
      ...(filters.estado
        ? { estado: filters.estado as EstadoOrdenTrabajo }
        : {}),
    };

    const [result, estadoGroups] = await Promise.all([
      paginate<OrdenTrabajoPrismaResult>(
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
      ),
      this.prisma.ordenesTrabajo.groupBy({
        by: ['estado'],
        where,
        _count: { _all: true },
      }),
    ]);

    const countByEstado = new Map<string, number>(
      estadoGroups.map((g) => [g.estado, g._count._all]),
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
      kpis: {
        total: result.meta.total,
        completadas: countByEstado.get(EstadoOrdenTrabajo.COMPLETADA) ?? 0,
        pendientes:
          (countByEstado.get(EstadoOrdenTrabajo.PENDIENTE) ?? 0) +
          (countByEstado.get(EstadoOrdenTrabajo.EN_PROGRESO) ?? 0),
        conNovedad: countByEstado.get(EstadoOrdenTrabajo.FALLIDA) ?? 0,
        canceladas: countByEstado.get(EstadoOrdenTrabajo.CANCELADA) ?? 0,
      },
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
      return await this.prisma.$transaction(async (tx) => {
        const orden = await tx.ordenesTrabajo.findUnique({
          where: { ordenTrabajoId },
        });

        if (!orden) {
          throw new EntityNotFoundException(
            'Orden de Trabajo',
            ordenTrabajoId.toString(),
          );
        }

        const lectura = await tx.lecturas.findUnique({
          where: { lecturaId: data.lecturaId },
        });

        if (!lectura) {
          throw new EntityNotFoundException(
            'Lectura',
            data.lecturaId.toString(),
          );
        }

        // Integridad de dominio: si la orden tiene un medidor asociado, la
        // lectura debe pertenecer al mismo medidor. Una lectura no se puede
        // vincular a una orden de un medidor distinto.
        if (orden.medidorId !== null && orden.medidorId !== lectura.medidorId) {
          throw new InvalidDomainOperationException(
            `La lectura pertenece al medidor ${lectura.medidorId} pero la orden requiere el medidor ${orden.medidorId}`,
          );
        }

        // Operación PURA: solo escribe `lecturaId`. Si el caller quiere
        // marcar la orden como completada, debe invocar `updateEstado`.
        const raw = await tx.ordenesTrabajo.update({
          where: { ordenTrabajoId },
          data: {
            lecturaId: data.lecturaId,
          },
        });

        return OrdenTrabajoMapper.toEntity(raw);
      });
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
}
