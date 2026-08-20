import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { Decimal } from 'decimal.js';
import {
  MeterRepository,
  CreateMeterRepositoryData,
  UpdateMeterRepositoryData,
  CreateMeterHistoryRepositoryData,
  ReplaceMeterRepositoryData,
  ReplaceMeterResult,
  MeterFilters,
} from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import type { EstadoMedidor, EstadoContrato } from 'src/shared/enums';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { MeterMapper } from '../mappers/meter.mapper';
import { ReemplazoMedidorMapper } from '../mappers/reemplazo-medidor.mapper';

export const safeMeterSelect = {
  medidorId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
} satisfies Prisma.MedidoresSelect;

export const safeMeterSelectWithDelete = {
  medidorId: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
  latitud: true,
  longitud: true,
  deletedAt: true,
} satisfies Prisma.MedidoresSelect;

@Injectable()
export class PrismaMeterRepository implements MeterRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: LoggerService,
  ) {}

  async findUnique(where: {
    medidorId?: bigint;
    serie?: string;
  }): Promise<MeterEntity | null> {
    const record = await this.prisma.medidores.findUnique({
      where: {
        ...(where.medidorId !== undefined && { medidorId: where.medidorId }),
        ...(where.serie !== undefined && { serie: where.serie }),
      } as Prisma.MedidoresWhereUniqueInput,
      include: {
        historial: {
          where: { fechaHasta: null },
          orderBy: { fechaDesde: 'desc' },
          take: 1,
          include: {
            contrato: {
              include: {
                cliente: true,
              },
            },
          },
        },
      },
    });
    return MeterMapper.toDomain(record);
  }

  async findMany(params: {
    where?: MeterFilters;
    take?: number;
    skip?: number;
  }): Promise<MeterEntity[]> {
    const where = this.buildMeterWhere(params.where);

    const records = await this.prisma.medidores.findMany({
      where,
      take: params.take,
      skip: params.skip,
      orderBy: { createdAt: 'desc' },
      include: {
        historial: {
          where: { fechaHasta: null },
          orderBy: { fechaDesde: 'desc' },
          take: 1,
          include: {
            contrato: {
              include: {
                cliente: true,
              },
            },
          },
        },
      },
    });
    return MeterMapper.toDomainList(records);
  }

  async count(where?: MeterFilters): Promise<number> {
    const whereClause = this.buildMeterWhere(where);
    return this.prisma.medidores.count({ where: whereClause });
  }

  async groupByEstado(
    where?: MeterFilters,
  ): Promise<
    Array<{ estado: MeterEntity['estado']; _count: { _all: number } }>
  > {
    const whereClause = this.buildMeterWhere(where);
    const groups = await this.prisma.medidores.groupBy({
      by: ['estado'],
      where: whereClause,
      _count: { _all: true },
    });
    return groups.map((g) => ({
      estado: g.estado,
      _count: { _all: Number(g._count._all) },
    }));
  }

  private buildMeterWhere(filters?: MeterFilters): Prisma.MedidoresWhereInput {
    const conditions: Prisma.MedidoresWhereInput[] = [];

    // Always exclude soft-deleted records
    conditions.push({ deletedAt: null });

    if (!filters) {
      return conditions.length === 1 ? conditions[0] : { AND: conditions };
    }

    if (filters.estado) {
      conditions.push({ estado: filters.estado });
    }

    if (filters.marca) {
      conditions.push({
        marca: { contains: filters.marca, mode: 'insensitive' },
      });
    }

    if (filters.modelo) {
      conditions.push({
        modelo: { contains: filters.modelo, mode: 'insensitive' },
      });
    }

    if (filters.serie) {
      conditions.push({
        serie: { contains: filters.serie, mode: 'insensitive' },
      });
    }

    if (filters.search) {
      conditions.push({
        OR: [
          { serie: { contains: filters.search, mode: 'insensitive' } },
          { marca: { contains: filters.search, mode: 'insensitive' } },
          { modelo: { contains: filters.search, mode: 'insensitive' } },
        ],
      });
    }

    if (conditions.length === 1) {
      return conditions[0];
    }

    return { AND: conditions };
  }

  async create(data: CreateMeterRepositoryData): Promise<MeterEntity> {
    try {
      const record = await this.prisma.medidores.create({
        data: {
          marca: data.marca,
          modelo: data.modelo,
          serie: data.serie,
          estado: data.estado,
          latitud: data.latitud,
          longitud: data.longitud,
        },
      });
      return MeterMapper.toDomain(record)!;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new EntityAlreadyExistsException('Medidor', 'serie', data.serie);
      }
      throw error;
    }
  }

  async update(
    where: { medidorId: bigint },
    data: UpdateMeterRepositoryData,
    tx?: Prisma.TransactionClient,
  ): Promise<MeterEntity> {
    const client = tx || this.prisma;
    const record = await client.medidores.update({
      where: { medidorId: where.medidorId },
      data: {
        ...(data.marca !== undefined && { marca: data.marca }),
        ...(data.modelo !== undefined && { modelo: data.modelo }),
        ...(data.serie !== undefined && { serie: data.serie }),
        ...(data.estado !== undefined && { estado: data.estado }),
        ...(data.fechaInstalacion !== undefined && {
          fechaInstalacion: data.fechaInstalacion,
        }),
        ...(data.fechaBaja !== undefined && { fechaBaja: data.fechaBaja }),
        ...(data.motivo !== undefined && { motivo: data.motivo }),
        ...(data.latitud !== undefined && { latitud: data.latitud }),
        ...(data.longitud !== undefined && { longitud: data.longitud }),
        ...(data.deletedAt !== undefined && { deletedAt: data.deletedAt }),
      },
    });
    return MeterMapper.toDomain(record)!;
  }

  async createHistory(
    data: CreateMeterHistoryRepositoryData,
    tx?: Prisma.TransactionClient,
  ): Promise<void> {
    const client = tx || this.prisma;
    await client.historialMedidores.create({
      data: {
        medidor: { connect: { medidorId: data.medidorId } },
        contrato: { connect: { contratoId: data.contratoId } },
        lecturaInicial: data.lecturaInicial,
        motivo: data.motivo,
        fechaDesde: data.fechaDesde,
      },
    });
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }

  async findActiveContractForMeter(
    medidorId: bigint,
  ): Promise<{ contratoId: bigint; estado: string } | null> {
    const historial = await this.prisma.historialMedidores.findFirst({
      where: { medidorId, fechaHasta: null },
      select: {
        contratoId: true,
        contrato: { select: { estado: true } },
      },
    });

    if (!historial) return null;

    return {
      contratoId: historial.contratoId,
      estado: historial.contrato.estado,
    };
  }

  async installMeter(params: {
    medidorId: bigint;
    contratoId: bigint;
    estado: EstadoMedidor;
    estadoContrato: EstadoContrato;
    fechaInstalacion: Date;
  }): Promise<MeterEntity> {
    const { medidorId, contratoId, estado, estadoContrato, fechaInstalacion } =
      params;

    const record = await this.prisma.$transaction(async (tx) => {
      const updatedMeter = await tx.medidores.update({
        where: { medidorId },
        data: {
          estado,
          fechaInstalacion,
        },
      });

      const openHistorial = await tx.historialMedidores.findFirst({
        where: { contratoId, fechaHasta: null },
      });

      if (!openHistorial) {
        this.logger.warn(
          `Install: no open historialMedidores row for contratoId=${contratoId}; skipping fechaHasta close`,
        );
      } else {
        await tx.historialMedidores.update({
          where: { historialId: openHistorial.historialId },
          data: { fechaHasta: fechaInstalacion },
        });
      }

      await tx.contratos.update({
        where: { contratoId },
        data: { estado: estadoContrato },
      });

      return updatedMeter;
    });

    return MeterMapper.toDomain(record)!;
  }

  async replaceMeter(
    params: ReplaceMeterRepositoryData,
  ): Promise<ReplaceMeterResult> {
    const {
      contratoId,
      nuevoMedidorId,
      lecturaFinalSaliente,
      lecturaInicialEntrante = new Decimal(0),
      motivo,
      responsabilidadDano = 'NO_APLICA',
      detalleMotivo,
      tratamientoSaliente,
      tratamientoEntrante,
      porcentajeCobro,
      ventanaPromedio,
      periodoOrigenId,
      periodoDestinoId,
      ordenTrabajoId,
      solicitadoPorUsuarioId,
      autorizadoPorUsuarioId,
      autorizadoEn,
      fechaReemplazo = new Date(),
    } = params;

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar contrato existente y obtener historial abierto
      const contrato = await tx.contratos.findUnique({
        where: { contratoId },
        include: {
          categoriaTarifa: true,
          historialMedidores: {
            where: { fechaHasta: null, deletedAt: null },
            include: { medidor: true },
          },
        },
      });

      if (!contrato) {
        throw new EntityNotFoundException('Contrato', contratoId);
      }

      const openHistorial = contrato.historialMedidores[0];
      if (!openHistorial) {
        throw new InvalidDomainOperationException(
          `El contrato #${contratoId} no tiene un medidor asignado actualmente para ser reemplazado`,
        );
      }

      const medidorSalienteId = openHistorial.medidorId;

      if (medidorSalienteId === nuevoMedidorId) {
        throw new InvalidDomainOperationException(
          'El nuevo medidor debe ser distinto del medidor saliente',
        );
      }

      // 2. Validar nuevo medidor disponible
      const nuevoMedidor = await tx.medidores.findUnique({
        where: { medidorId: nuevoMedidorId },
        include: {
          historial: {
            where: { fechaHasta: null, deletedAt: null },
          },
        },
      });

      if (!nuevoMedidor || nuevoMedidor.deletedAt) {
        throw new EntityNotFoundException('Medidor', nuevoMedidorId);
      }

      if (nuevoMedidor.historial.length > 0) {
        throw new InvalidDomainOperationException(
          `El medidor #${nuevoMedidorId} ya se encuentra asignado al contrato #${nuevoMedidor.historial[0].contratoId}`,
        );
      }

      // 3. Obtener última lectura aprobada o lectura inicial del historial saliente
      const lastApprovedReading = await tx.lecturas.findFirst({
        where: {
          medidorId: medidorSalienteId,
          fecha: { gte: openHistorial.fechaDesde, lte: fechaReemplazo },
          estado: 'APROBADA',
          deletedAt: null,
        },
        orderBy: [{ fecha: 'desc' }, { lecturaId: 'desc' }],
      });

      const baseReadingSaliente = lastApprovedReading
        ? new Decimal(lastApprovedReading.lecturaActual.toString())
        : new Decimal(openHistorial.lecturaInicial.toString());

      // 4. Calcular consumo físico medido del saliente
      const finalSalienteDec = new Decimal(lecturaFinalSaliente.toString());
      if (finalSalienteDec.lt(baseReadingSaliente)) {
        throw new InvalidDomainOperationException(
          `La lectura final de retiro (${finalSalienteDec.toString()}) no puede ser menor a la lectura base previa (${baseReadingSaliente.toString()})`,
        );
      }

      const consumoMedidoSaliente = finalSalienteDec.minus(baseReadingSaliente);

      // 5. Calcular consumo facturable según política saliente
      let consumoFacturableSaliente = new Decimal(0);
      let promedioCalculado: Decimal | null = null;

      if (tratamientoSaliente === 'COBRO_REAL') {
        consumoFacturableSaliente = consumoMedidoSaliente;
      } else if (tratamientoSaliente === 'EXONERADO') {
        consumoFacturableSaliente = new Decimal(0);
      } else if (tratamientoSaliente === 'PROMEDIO_HISTORICO') {
        const limitMonths = ventanaPromedio || 3;
        const pastReadings = await tx.lecturas.findMany({
          where: {
            medidor: {
              historial: {
                some: {
                  contratoId,
                  deletedAt: null,
                },
              },
            },
            periodoId: {
              lt: periodoOrigenId,
            },
            estado: 'APROBADA',
            deletedAt: null,
          },
          orderBy: { fecha: 'desc' },
          take: limitMonths,
        });

        if (pastReadings.length > 0) {
          const sum = pastReadings.reduce(
            (acc, curr) =>
              acc.plus(new Decimal(curr.consumoCalculado.toString())),
            new Decimal(0),
          );
          promedioCalculado = sum
            .dividedBy(pastReadings.length)
            .toDecimalPlaces(2);
          consumoFacturableSaliente = promedioCalculado;
        } else {
          // Fallback a consumo mínimo de tarifa
          const baseTariff = contrato.categoriaTarifa?.consumoMinimoMensual
            ? new Decimal(
                contrato.categoriaTarifa.consumoMinimoMensual.toString(),
              )
            : new Decimal(0);
          promedioCalculado = baseTariff;
          consumoFacturableSaliente = baseTariff;
        }
      } else if (tratamientoSaliente === 'COBRO_PARCIAL') {
        if (porcentajeCobro) {
          const pct = new Decimal(porcentajeCobro.toString()).dividedBy(100);
          consumoFacturableSaliente = consumoMedidoSaliente
            .mul(pct)
            .toDecimalPlaces(2);
        } else {
          consumoFacturableSaliente = consumoMedidoSaliente;
        }
      }

      // 6. Tratamiento entrante
      const consumoMedidoEntrante = new Decimal(0);
      const consumoFacturableEntrante = new Decimal(0);
      const consumoDiferidoEntrante =
        tratamientoEntrante === 'DIFERIR_SIGUIENTE_PERIODO'
          ? new Decimal(0)
          : new Decimal(0);

      // 7. Registrar lectura física de retiro en Lecturas
      const lecturaFinalRecord = await tx.lecturas.create({
        data: {
          medidorId: medidorSalienteId,
          periodoId: periodoOrigenId,
          fecha: fechaReemplazo,
          lecturaAnterior: new Prisma.Decimal(baseReadingSaliente.toString()),
          lecturaActual: new Prisma.Decimal(finalSalienteDec.toString()),
          consumoCalculado: new Prisma.Decimal(
            consumoMedidoSaliente.toString(),
          ),
          lecturaInicial: false,
          estado: 'APROBADA',
        },
      });

      // 8. Cerrar historial saliente
      await tx.historialMedidores.update({
        where: { historialId: openHistorial.historialId },
        data: {
          fechaHasta: fechaReemplazo,
          lecturaFinal: new Prisma.Decimal(finalSalienteDec.toString()),
          motivo: `${motivo}${detalleMotivo ? ': ' + detalleMotivo : ''}`,
          actualizadoPor: solicitadoPorUsuarioId,
        },
      });

      // 9. Actualizar estado de medidor saliente
      const estadoFinalSaliente =
        motivo === 'DANO'
          ? 'DANADO'
          : motivo === 'FIN_VIDA_UTIL'
            ? 'BAJA'
            : 'BODEGA';

      await tx.medidores.update({
        where: { medidorId: medidorSalienteId },
        data: {
          estado: estadoFinalSaliente,
          fechaBaja: fechaReemplazo,
          motivo: `${motivo}${detalleMotivo ? ': ' + detalleMotivo : ''}`,
        },
      });

      // 10. Abrir historial entrante
      const initialEntranteDec = new Decimal(lecturaInicialEntrante.toString());
      const nuevoHistorial = await tx.historialMedidores.create({
        data: {
          contratoId,
          medidorId: nuevoMedidorId,
          fechaDesde: fechaReemplazo,
          lecturaInicial: new Prisma.Decimal(initialEntranteDec.toString()),
          motivo: 'Instalación por reemplazo',
          creadoPor: solicitadoPorUsuarioId,
        },
      });

      // 11. Registrar lectura física inicial del entrante
      const lecturaInicialRecord = await tx.lecturas.create({
        data: {
          medidorId: nuevoMedidorId,
          periodoId: periodoOrigenId,
          fecha: fechaReemplazo,
          lecturaAnterior: new Prisma.Decimal(initialEntranteDec.toString()),
          lecturaActual: new Prisma.Decimal(initialEntranteDec.toString()),
          consumoCalculado: new Prisma.Decimal('0'),
          lecturaInicial: true,
          estado: 'APROBADA',
        },
      });

      // 12. Actualizar estado de medidor entrante
      await tx.medidores.update({
        where: { medidorId: nuevoMedidorId },
        data: {
          estado: 'INSTALADO',
          fechaInstalacion: fechaReemplazo,
        },
      });

      // 13. Snapshot de tarifa de origen
      const tarifaSnapshot = contrato.categoriaTarifa
        ? {
            categoriaTarifaId: contrato.categoriaTarifa.categoriaTarifaId,
            nombre: contrato.categoriaTarifa.nombre,
            valorBase: contrato.categoriaTarifa.valorBase?.toString(),
            valorExcedenteM3:
              contrato.categoriaTarifa.valorExcedenteM3?.toString(),
            consumoMinimoMensual:
              contrato.categoriaTarifa.consumoMinimoMensual?.toString(),
            fechaVigenciaDesde:
              contrato.categoriaTarifa.fechaVigenciaDesde?.toISOString(),
            fechaVigenciaHasta:
              contrato.categoriaTarifa.fechaVigenciaHasta?.toISOString(),
          }
        : null;

      // 14. Crear registro auditable en ReemplazoMedidor
      const reemplazoRecord = await tx.reemplazoMedidor.create({
        data: {
          contratoId,
          historialSalienteId: openHistorial.historialId,
          historialEntranteId: nuevoHistorial.historialId,
          lecturaFinalSalienteId: lecturaFinalRecord.lecturaId,
          lecturaInicialEntranteId: lecturaInicialRecord.lecturaId,
          ordenTrabajoId: ordenTrabajoId ?? null,
          periodoOrigenId,
          periodoDestinoId: periodoDestinoId ?? null,
          mesOrigen: params.mesOrigen ?? new Date().getMonth() + 1,
          mesDestino: params.mesDestino ?? null,
          motivo,
          responsabilidadDano,
          detalleMotivo: detalleMotivo ?? null,
          tratamientoSaliente,
          tratamientoEntrante,
          consumoMedidoSaliente: new Prisma.Decimal(
            consumoMedidoSaliente.toString(),
          ),
          consumoFacturableSaliente: new Prisma.Decimal(
            consumoFacturableSaliente.toString(),
          ),
          consumoMedidoEntrante: new Prisma.Decimal(
            consumoMedidoEntrante.toString(),
          ),
          consumoFacturableEntrante: new Prisma.Decimal(
            consumoFacturableEntrante.toString(),
          ),
          consumoDiferidoEntrante: new Prisma.Decimal(
            consumoDiferidoEntrante.toString(),
          ),
          ventanaPromedio: ventanaPromedio ?? null,
          promedioCalculado: promedioCalculado
            ? new Prisma.Decimal(promedioCalculado.toString())
            : null,
          porcentajeCobro: porcentajeCobro
            ? new Prisma.Decimal(porcentajeCobro.toString())
            : null,
          tarifaOrigenSnapshot: (tarifaSnapshot as any) ?? Prisma.JsonNull,
          estado: 'PENDIENTE',
          solicitadoPorUsuarioId: solicitadoPorUsuarioId ?? null,
          autorizadoPorUsuarioId: autorizadoPorUsuarioId ?? null,
          autorizadoEn: autorizadoEn ?? fechaReemplazo,
          creadoPor: solicitadoPorUsuarioId ?? null,
        },
      });

      return {
        reemplazo: ReemplazoMedidorMapper.toDomain(reemplazoRecord)!,
        historialSalienteId: openHistorial.historialId,
        historialEntranteId: nuevoHistorial.historialId,
        consumoMedidoSaliente,
        consumoFacturableSaliente,
        consumoDiferidoEntrante,
      };
    });
  }
}
