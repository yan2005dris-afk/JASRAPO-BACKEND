import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EstadoOrdenTrabajo,
  EstadoCobranzaContrato,
  EstadoPeriodo,
  EstadoRuta,
  EstadoServicioContrato,
  TipoActividadCodes,
} from 'src/shared/enums';
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
  CreateOrdenTrabajoData,
  UpdateOperatorWorkOrderData,
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
  estado: string;
  ordenVisita: number;
  resultadoObservacion: string | null;
  evidenciaFotoUrl: string | null;
  completadoEn: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  lecturaId: bigint | null;
  ruta: { tipoActividad: { codigo: string } };

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
      include: {
        ruta: { include: { tipoActividad: { select: { codigo: true } } } },
      },
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
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
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
        ruta: raw.ruta,
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

  async verifyOperatorWorkOrderOwnership(
    operarioId: number,
    ordenTrabajoId: bigint,
  ): Promise<void> {
    const order = await this.prisma.ordenesTrabajo.findFirst({
      where: {
        ordenTrabajoId,
        deletedAt: null,
        ruta: {
          operarioId,
          deletedAt: null,
          estado: {
            notIn: [EstadoRuta.CANCELADA, EstadoRuta.COMPLETADA],
          },
          periodo: {
            estado: EstadoPeriodo.ABIERTO,
            deletedAt: null,
          },
        },
      },
      select: { ordenTrabajoId: true },
    });

    if (!order) {
      throw new InvalidDomainOperationException(
        'No puedes iniciar esta operación porque no estás asignado como operario a esta orden de trabajo.',
      );
    }
  }

  async updateEstado(
    ordenTrabajoId: bigint,
    data: UpdateOrdenEstadoData,
  ): Promise<OrdenTrabajoEntity> {
    try {
      const raw = await this.prisma.$transaction(async (tx) => {
        const current = await tx.ordenesTrabajo.findUnique({
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
          where: { ordenTrabajoId },
        });

        if (!current) {
          throw new EntityNotFoundException(
            'Orden de Trabajo',
            ordenTrabajoId.toString(),
          );
        }

        await this.applyContractLifecycleTransition(tx, current, data.estado);

        const isCompleting =
          data.estado === EstadoOrdenTrabajo.COMPLETADA ||
          data.estado === EstadoOrdenTrabajo.FALLIDA ||
          data.estado === EstadoOrdenTrabajo.CANCELADA;

        const isReopening =
          data.estado === EstadoOrdenTrabajo.PENDIENTE ||
          data.estado === EstadoOrdenTrabajo.EN_PROGRESO;

        return tx.ordenesTrabajo.update({
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
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

  async updateOperatorWorkOrder(
    ordenTrabajoId: bigint,
    data: UpdateOperatorWorkOrderData,
  ): Promise<OrdenTrabajoEntity> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const current = await tx.ordenesTrabajo.findUnique({
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
          where: { ordenTrabajoId },
        });

        if (!current) {
          throw new EntityNotFoundException(
            'Orden de Trabajo',
            ordenTrabajoId.toString(),
          );
        }

        await this.applyContractLifecycleTransition(tx, current, data.estado);

        const isCompleting =
          data.estado === EstadoOrdenTrabajo.COMPLETADA ||
          data.estado === EstadoOrdenTrabajo.FALLIDA ||
          data.estado === EstadoOrdenTrabajo.CANCELADA;
        const isReopening =
          data.estado === EstadoOrdenTrabajo.PENDIENTE ||
          data.estado === EstadoOrdenTrabajo.EN_PROGRESO;
        const completionUpdate =
          data.completadoEn !== undefined
            ? { completadoEn: data.completadoEn }
            : isCompleting && !current.completadoEn
              ? { completadoEn: new Date() }
              : isReopening
                ? { completadoEn: null }
                : {};

        const raw = await tx.ordenesTrabajo.update({
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
          where: { ordenTrabajoId },
          data: {
            ...(data.estado !== undefined
              ? { estado: data.estado as EstadoOrdenTrabajo }
              : {}),
            ...(data.resultadoObservacion !== undefined
              ? { resultadoObservacion: data.resultadoObservacion }
              : {}),
            ...(data.evidenciaFotoUrl !== undefined
              ? { evidenciaFotoUrl: data.evidenciaFotoUrl }
              : {}),
            ...completionUpdate,
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

  private async applyContractLifecycleTransition(
    tx: Prisma.TransactionClient,
    current: {
      estado: string;
      contratoId: bigint;
      ruta: { tipoActividad: { codigo: string } };
    },
    targetState: string | undefined,
  ): Promise<void> {
    if (
      targetState !== EstadoOrdenTrabajo.COMPLETADA ||
      current.estado === EstadoOrdenTrabajo.COMPLETADA
    ) {
      return;
    }

    const requiredSourceState =
      current.ruta.tipoActividad.codigo === TipoActividadCodes.INSTALACION
        ? EstadoServicioContrato.PENDIENTE_INSTALACION
        : current.ruta.tipoActividad.codigo === TipoActividadCodes.RECONEXION
          ? EstadoServicioContrato.SUSPENDIDO
          : null;

    if (!requiredSourceState) return;

    const contract = await tx.contratos.findUnique({
      where: { contratoId: current.contratoId },
      select: { estadoServicio: true },
    });

    if (!contract) {
      throw new EntityNotFoundException(
        'Contrato',
        current.contratoId.toString(),
      );
    }

    if (contract.estadoServicio !== requiredSourceState) {
      throw new InvalidDomainOperationException(
        `El contrato debe estar en ${requiredSourceState} para completar una orden de ${current.ruta.tipoActividad.codigo}`,
      );
    }

    await tx.contratos.update({
      where: { contratoId: current.contratoId },
      data: {
        estadoServicio: EstadoServicioContrato.ACTIVO,
        estadoCobranza: EstadoCobranzaContrato.AL_DIA,
      },
    });
  }

  async linkLectura(
    ordenTrabajoId: bigint,
    data: LinkLecturaData,
  ): Promise<OrdenTrabajoEntity> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const orden = await tx.ordenesTrabajo.findUnique({
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
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
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
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

  async create(data: CreateOrdenTrabajoData): Promise<OrdenTrabajoEntity> {
    const raw = await this.prisma.ordenesTrabajo.create({
      include: {
        ruta: { include: { tipoActividad: { select: { codigo: true } } } },
      },
      data: {
        rutaId: data.rutaId,
        contratoId: data.contratoId,
        medidorId: data.medidorId ?? null,
        estado: (data.estado ??
          EstadoOrdenTrabajo.PENDIENTE) as EstadoOrdenTrabajo,
        ordenVisita: data.ordenVisita ?? 0,
      },
    });
    return OrdenTrabajoMapper.toEntity(raw);
  }

  async findActiveInstallationByContratoId(
    contratoId: bigint,
  ): Promise<OrdenTrabajoEntity | null> {
    const raw = await this.prisma.ordenesTrabajo.findFirst({
      include: {
        ruta: { include: { tipoActividad: { select: { codigo: true } } } },
      },
      where: {
        contratoId,
        deletedAt: null,
        estado: {
          notIn: [EstadoOrdenTrabajo.CANCELADA, EstadoOrdenTrabajo.FALLIDA],
        },
        ruta: { tipoActividad: { codigo: TipoActividadCodes.INSTALACION } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return raw ? OrdenTrabajoMapper.toEntity(raw) : null;
  }

  async reassignInstallationOrder(
    ordenTrabajoId: bigint,
    toRutaId: bigint,
  ): Promise<OrdenTrabajoEntity> {
    return this.prisma.$transaction(async (tx) => {
      const orden = await tx.ordenesTrabajo.findUnique({
        where: { ordenTrabajoId },
        select: { rutaId: true },
      });

      if (!orden) {
        throw new EntityNotFoundException(
          'OrdenTrabajo',
          ordenTrabajoId.toString(),
        );
      }

      const fromRutaId = orden.rutaId;

      const updated = await tx.ordenesTrabajo.update({
        where: { ordenTrabajoId },
        data: { rutaId: toRutaId },
        include: {
          ruta: { include: { tipoActividad: { select: { codigo: true } } } },
        },
      });

      // Si la ruta de origen quedó sin órdenes y sin operario, se cancela
      // (era una ruta de instalación auto-generada que quedó huérfana).
      if (fromRutaId !== toRutaId) {
        const remaining = await tx.ordenesTrabajo.count({
          where: { rutaId: fromRutaId, deletedAt: null },
        });
        const fromRuta = await tx.rutas.findUnique({
          where: { rutaId: fromRutaId },
          select: { operarioId: true },
        });

        if (remaining === 0 && fromRuta && fromRuta.operarioId === null) {
          await tx.rutas.update({
            where: { rutaId: fromRutaId },
            data: { estado: EstadoRuta.CANCELADA },
          });
        }
      }

      return OrdenTrabajoMapper.toEntity(updated);
    });
  }
}
