import { ensureContractWorkOrder } from 'src/operations/contracts/infrastructure/contract-work-order';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  EstadoOrdenTrabajo,
  EstadoMedidor,
  EstadoCobranzaContrato,
  EstadoPeriodo,
  EstadoRuta,
  EstadoServicioContrato,
  TipoActividadCodes,
} from 'src/shared/enums';
import { OrdenTrabajoRepository } from '../../domain/repositories/orden-trabajo.repository';
import {
  ordenTrabajoInclude,
  type OrdenTrabajoRow,
} from 'src/operations/routes/infrastructure/repositories/route.include';
import {
  paginate,
  PaginateOptions,
} from 'src/shared/pagination/pagination.util';
import { PaginatedResult } from 'src/shared/pagination/pagination.types';
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

@Injectable()
export class PrismaOrdenTrabajoRepository implements OrdenTrabajoRepository {
  constructor(private readonly prisma: PrismaService) {}

  async assignInstallationRoute(
    contratoId: bigint,
    routeId?: bigint,
  ): Promise<bigint> {
    return this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT contrato_id FROM contratos WHERE contrato_id = ${contratoId} FOR UPDATE`;
      const contract = await tx.contratos.findUnique({ where: { contratoId } });
      if (!contract || contract.deletedAt)
        throw new EntityNotFoundException('Contrato', contratoId);
      if (contract.estadoServicio !== 'PENDIENTE_INSTALACION') {
        throw new InvalidDomainOperationException(
          'El contrato debe estar en estado PENDIENTE_INSTALACION',
        );
      }
      const link = await tx.historialMedidores.findFirst({
        where: {
          contratoId,
          fechaHasta: null,
          deletedAt: null,
          medidor: { estado: 'PENDIENTE', deletedAt: null },
        },
      });
      if (!link)
        throw new InvalidDomainOperationException(
          'La instalación requiere un medidor pendiente y vinculado al contrato',
        );
      if (routeId !== undefined) {
        const route = await tx.rutas.findUnique({
          where: { rutaId: routeId },
          include: { tipoActividad: true },
        });
        if (!route || route.deletedAt)
          throw new EntityNotFoundException('Ruta', routeId);
        if (
          route.tipoActividad.codigo !== 'INSTALACION' ||
          route.estado !== 'PENDIENTE'
        ) {
          throw new InvalidDomainOperationException(
            'La ruta debe ser de tipo INSTALACION y estar en estado PENDIENTE',
          );
        }
        if (route.comunidadId !== contract.comunidadId) {
          throw new InvalidDomainOperationException(
            'La ruta debe pertenecer a la comunidad del contrato',
          );
        }
      }
      const order = await ensureContractWorkOrder(
        tx,
        contract,
        link.medidorId,
        'INSTALACION',
      );
      if (order.estado !== 'PENDIENTE')
        throw new InvalidDomainOperationException(
          'La orden debe estar PENDIENTE para asignar su ruta',
        );
      if (routeId !== undefined && routeId !== order.rutaId) {
        await tx.ordenesTrabajo.update({
          where: { ordenTrabajoId: order.ordenTrabajoId },
          data: { rutaId: routeId },
        });
      }
      return routeId ?? order.rutaId;
    });
  }

  async findById(
    ordenTrabajoId: bigint,
    includeDeleted: boolean = false,
  ): Promise<OrdenTrabajoRow | null> {
    return this.prisma.ordenesTrabajo.findFirst({
      include: ordenTrabajoInclude,
      where: {
        ordenTrabajoId,
        ...(includeDeleted ? {} : { deletedAt: null }),
      },
    });
  }

  async findByRutaId(
    rutaId: bigint,
    filters: OrdenTrabajoFilters,
    pagination: PaginateOptions,
  ): Promise<PaginatedResult<OrdenTrabajoRow, OrdenTrabajoKpis>> {
    const where: Prisma.OrdenesTrabajoWhereInput = {
      rutaId,
      deletedAt: null,
      ...(filters.estado
        ? { estado: filters.estado as EstadoOrdenTrabajo }
        : {}),
    };

    const [result, estadoGroups] = await Promise.all([
      paginate<OrdenTrabajoRow>(
        this.prisma.ordenesTrabajo,
        {
          where,
          include: ordenTrabajoInclude,
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

    return {
      data: result.data,
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
  ): Promise<OrdenTrabajoRow> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT c.contrato_id FROM contratos c JOIN ordenes_trabajo ot ON ot.contrato_id = c.contrato_id WHERE ot.orden_trabajo_id = ${ordenTrabajoId} FOR UPDATE OF c`;
        await tx.$queryRaw`SELECT orden_trabajo_id FROM ordenes_trabajo WHERE orden_trabajo_id = ${ordenTrabajoId} FOR UPDATE`;
        const current = await tx.ordenesTrabajo.findUnique({
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
          where: { ordenTrabajoId },
        });

        if (!current || current.deletedAt) {
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
          include: ordenTrabajoInclude,
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
  ): Promise<OrdenTrabajoRow> {
    try {
      return await this.prisma.$transaction(async (tx) => {
        await tx.$queryRaw`SELECT c.contrato_id FROM contratos c JOIN ordenes_trabajo ot ON ot.contrato_id = c.contrato_id WHERE ot.orden_trabajo_id = ${ordenTrabajoId} FOR UPDATE OF c`;
        await tx.$queryRaw`SELECT orden_trabajo_id FROM ordenes_trabajo WHERE orden_trabajo_id = ${ordenTrabajoId} FOR UPDATE`;
        const current = await tx.ordenesTrabajo.findUnique({
          include: {
            ruta: { include: { tipoActividad: { select: { codigo: true } } } },
          },
          where: { ordenTrabajoId },
        });

        if (!current || current.deletedAt) {
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

        return await tx.ordenesTrabajo.update({
          include: ordenTrabajoInclude,
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
            ...(data.latitud !== undefined ? { latitud: data.latitud } : {}),
            ...(data.longitud !== undefined ? { longitud: data.longitud } : {}),
            ...completionUpdate,
          },
        });
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
      medidorId: bigint | null;
      ruta: { tipoActividad: { codigo: string } };
    },
    targetState: string | undefined,
  ): Promise<void> {
    if (
      current.ruta.tipoActividad.codigo === TipoActividadCodes.INSTALACION &&
      current.estado === EstadoOrdenTrabajo.COMPLETADA &&
      targetState &&
      targetState !== current.estado
    ) {
      throw new InvalidDomainOperationException(
        'Una instalaci\u00f3n completada no puede reabrirse',
      );
    }
    if (current.ruta.tipoActividad.codigo === TipoActividadCodes.INSPECCION) {
      if (
        current.estado === EstadoOrdenTrabajo.COMPLETADA ||
        current.estado === EstadoOrdenTrabajo.CANCELADA
      ) {
        if (targetState && targetState !== current.estado) {
          throw new InvalidDomainOperationException(
            'Una inspección resuelta no puede reabrirse ni cambiar su resultado',
          );
        }
        return;
      }
      if (
        targetState === EstadoOrdenTrabajo.COMPLETADA ||
        targetState === EstadoOrdenTrabajo.CANCELADA
      ) {
        await tx.$queryRaw`SELECT contrato_id FROM contratos WHERE contrato_id = ${current.contratoId} FOR UPDATE`;
        const contract = await tx.contratos.findUnique({
          where: { contratoId: current.contratoId },
        });
        if (
          !contract ||
          contract.deletedAt ||
          contract.estadoServicio !==
            EstadoServicioContrato.PENDIENTE_INSPECCION
        ) {
          throw new InvalidDomainOperationException(
            'El contrato debe estar en PENDIENTE_INSPECCION para resolver la inspección',
          );
        }
        const link = await tx.historialMedidores.findFirst({
          where: {
            contratoId: current.contratoId,
            medidorId: current.medidorId ?? -1n,
            fechaHasta: null,
            deletedAt: null,
            medidor: { estado: EstadoMedidor.PENDIENTE, deletedAt: null },
          },
        });
        if (!link) {
          throw new InvalidDomainOperationException(
            'La inspección requiere el medidor reservado y vinculado al contrato',
          );
        }
        const approved = targetState === EstadoOrdenTrabajo.COMPLETADA;
        await tx.contratos.update({
          where: { contratoId: current.contratoId },
          data: {
            estadoServicio: approved ? 'PENDIENTE_PAGO' : 'RECHAZADO',
            estadoCobranza: 'NO_APLICA',
          },
        });
        if (approved) {
          await tx.$executeRaw`SELECT generar_prefactura_instalacion(${current.contratoId}, ${contract.creadoPor || 'SYSTEM'})`;
        } else {
          const released = await tx.medidores.updateMany({
            where: {
              medidorId: link.medidorId,
              estado: EstadoMedidor.PENDIENTE,
              deletedAt: null,
            },
            data: { estado: EstadoMedidor.BODEGA, fechaInstalacion: null },
          });
          if (released.count !== 1)
            throw new InvalidDomainOperationException(
              'El medidor ya no está reservado',
            );
          await tx.historialMedidores.update({
            where: { historialId: link.historialId },
            data: {
              fechaHasta: new Date(),
              lecturaFinal: link.lecturaInicial,
              observacion: 'Inspección rechazada',
            },
          });
        }
      }
      return;
    }

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

    if (current.ruta.tipoActividad.codigo === TipoActividadCodes.INSTALACION) {
      if (current.medidorId === null) {
        throw new InvalidDomainOperationException(
          'La orden de instalación debe tener un medidor asignado',
        );
      }

      const installed = await tx.medidores.updateMany({
        where: {
          medidorId: current.medidorId,
          estado: EstadoMedidor.PENDIENTE,
          deletedAt: null,
          historial: {
            some: {
              contratoId: current.contratoId,
              fechaHasta: null,
              deletedAt: null,
            },
          },
        },
        data: {
          estado: EstadoMedidor.INSTALADO,
          fechaInstalacion: new Date(),
        },
      });

      if (installed.count !== 1) {
        throw new InvalidDomainOperationException(
          'El medidor debe estar pendiente y vinculado al contrato para completar la instalación',
        );
      }
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
  ): Promise<OrdenTrabajoRow> {
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
        return await tx.ordenesTrabajo.update({
          include: ordenTrabajoInclude,
          where: { ordenTrabajoId },
          data: {
            lecturaId: data.lecturaId,
          },
        });
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

  async create(data: CreateOrdenTrabajoData): Promise<OrdenTrabajoRow> {
    return await this.prisma.ordenesTrabajo.create({
      include: ordenTrabajoInclude,
      data: {
        rutaId: data.rutaId,
        contratoId: data.contratoId,
        medidorId: data.medidorId ?? null,
        estado: (data.estado ??
          EstadoOrdenTrabajo.PENDIENTE) as EstadoOrdenTrabajo,
        ordenVisita: data.ordenVisita ?? 0,
      },
    });
  }
}
