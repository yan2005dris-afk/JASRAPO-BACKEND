import { ConflictException, Injectable } from '@nestjs/common';
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
  ApproveMeterReplacementRepositoryData,
  MeterFilters,
} from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import {
  EntityAlreadyExistsException,
  EntityNotFoundException,
  InvalidDomainOperationException,
} from 'src/shared/domain/exceptions/domain.exception';
import { LoggerService } from 'src/infrastructure/observability/logger/logger.service';
import { MeterMapper } from '../mappers/meter.mapper';
import { ReemplazoMedidorMapper } from '../mappers/reemplazo-medidor.mapper';
import { MeterHistoryMapper } from '../mappers/meter-history.mapper';
import { MeterHistoryEntity } from '../../domain/entities/meter-history.entity';
import { ReemplazoMedidorEntity } from '../../domain/entities/reemplazo-medidor.entity';

export const safeMeterSelect = {
  medidorId: true,
  codigo: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
} satisfies Prisma.MedidoresSelect;

export const safeMeterSelectWithDelete = {
  medidorId: true,
  codigo: true,
  marca: true,
  modelo: true,
  serie: true,
  estado: true,
  fechaInstalacion: true,
  fechaBaja: true,
  motivo: true,
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

  /**
   * Takes the next correlative code, locking the single counter row so two
   * concurrent creations cannot read the same value. It runs inside the same
   * transaction as the insert, so a failed creation rolls the counter back and
   * the sequence is left without holes.
   */
  private async takeNextMeterCode(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const [config] = await tx.$queryRaw<
      { secuencia_medidor_id: number; prefijo: string; longitud: number }[]
    >`
      SELECT "secuencia_medidor_id", "prefijo", "longitud"
      FROM "secuencia_medidor"
      ORDER BY "secuencia_medidor_id"
      LIMIT 1
      FOR UPDATE
    `;

    if (!config) {
      throw new InvalidDomainOperationException(
        'No existe la configuración de secuencia de medidores',
      );
    }

    const updated = await tx.secuenciaMedidor.update({
      where: { secuenciaMedidorId: config.secuencia_medidor_id },
      data: { ultimoValor: { increment: 1 } },
      select: { ultimoValor: true },
    });

    const correlativo = String(updated.ultimoValor).padStart(
      config.longitud,
      '0',
    );
    return `${config.prefijo}-${correlativo}`;
  }

  async create(data: CreateMeterRepositoryData): Promise<MeterEntity> {
    try {
      const record = await this.prisma.$transaction(async (tx) => {
        const codigo = await this.takeNextMeterCode(tx);

        return tx.medidores.create({
          data: {
            codigo,
            marca: data.marca,
            modelo: data.modelo,
            serie: data.serie,
            estado: data.estado,
          },
        });
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
  ): Promise<{ contratoId: bigint; estadoServicio: string } | null> {
    const historial = await this.prisma.historialMedidores.findFirst({
      where: { medidorId, fechaHasta: null },
      select: {
        contratoId: true,
        contrato: { select: { estadoServicio: true } },
      },
    });

    if (!historial) return null;

    return {
      contratoId: historial.contratoId,
      estadoServicio: historial.contrato.estadoServicio,
    };
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
      claveIdempotencia,
      huellaSolicitud,
      requiereAprobacion,
    } = params;

    const maxAttempts = 3;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const replay = await tx.reemplazoMedidor.findUnique({
              where: {
                solicitadoPorUsuarioId_claveIdempotencia: {
                  solicitadoPorUsuarioId,
                  claveIdempotencia,
                },
              },
            });
            if (replay) {
              if (replay.huellaSolicitud !== huellaSolicitud) {
                throw new ConflictException(
                  'La clave de idempotencia ya fue utilizada con otra solicitud',
                );
              }
              return this.toReplaceMeterResult(replay);
            }

            await tx.$queryRaw`SELECT contrato_id FROM contratos WHERE contrato_id = ${contratoId} FOR UPDATE`;

            if (
              tratamientoEntrante === 'DIFERIR_SIGUIENTE_PERIODO' &&
              periodoDestinoId !== undefined
            ) {
              const periods = await tx.periodos.findMany({
                where: {
                  periodoId: { in: [periodoOrigenId, periodoDestinoId] },
                },
                select: { periodoId: true, fechaInicio: true },
              });
              const originPeriod = periods.find(
                (period) => period.periodoId === periodoOrigenId,
              );
              const destinationPeriod = periods.find(
                (period) => period.periodoId === periodoDestinoId,
              );
              if (!originPeriod || !destinationPeriod) {
                throw new InvalidDomainOperationException(
                  'El período origen o destino no existe',
                );
              }
              const originMonth =
                params.mesOrigen ?? fechaReemplazo.getMonth() + 1;
              const destinationMonth = params.mesDestino;
              const validSamePeriod =
                periodoDestinoId === periodoOrigenId &&
                originMonth < 12 &&
                destinationMonth === originMonth + 1;
              const validNextPeriod =
                periodoDestinoId !== periodoOrigenId &&
                originMonth === 12 &&
                destinationMonth === 1 &&
                destinationPeriod.fechaInicio.getUTCFullYear() ===
                  originPeriod.fechaInicio.getUTCFullYear() + 1;
              if (!validSamePeriod && !validNextPeriod) {
                throw new InvalidDomainOperationException(
                  'El ciclo destino debe ser el ciclo mensual inmediatamente posterior al origen',
                );
              }
            }

            // 1. Validar contrato existente y obtener historial abierto
            const contrato = await tx.contratos.findUnique({
              where: { contratoId },
              include: {
                categoriaTarifa: {
                  include: {
                    rubros: {
                      where: { activo: true, deletedAt: null },
                    },
                  },
                },
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
            const finalSalienteDec = new Decimal(
              lecturaFinalSaliente.toString(),
            );
            if (finalSalienteDec.lt(baseReadingSaliente)) {
              throw new InvalidDomainOperationException(
                `La lectura final de retiro (${finalSalienteDec.toString()}) no puede ser menor a la lectura base previa (${baseReadingSaliente.toString()})`,
              );
            }

            const consumoMedidoSaliente =
              finalSalienteDec.minus(baseReadingSaliente);

            // 5. Calcular consumo facturable según política saliente
            let consumoFacturableSaliente = new Decimal(0);
            let promedioCalculado: Decimal | null = null;

            if (tratamientoSaliente === 'COBRO_REAL') {
              consumoFacturableSaliente = consumoMedidoSaliente;
            } else if (tratamientoSaliente === 'EXONERADO') {
              consumoFacturableSaliente = new Decimal(0);
            } else if (tratamientoSaliente === 'PROMEDIO_HISTORICO') {
              const limitMonths = ventanaPromedio ?? 3;
              const pastReadings = await tx.$queryRaw<
                Array<{ consumo_calculado: Prisma.Decimal }>
              >`
          SELECT consumo_calculado
          FROM (
            SELECT DISTINCT ON (l.periodo_id, EXTRACT(MONTH FROM l.fecha))
              l.consumo_calculado, l.fecha, l.lectura_id
            FROM lecturas l
            JOIN historial_medidores hm ON hm.medidor_id = l.medidor_id
            WHERE hm.contrato_id = ${contratoId}
              AND hm.borrado_en IS NULL
              AND l.estado = 'APROBADA'::"EstadoLectura"
              AND l.borrado_en IS NULL
              AND l.descripcion_anomalia IS NULL
              AND l.fecha < ${fechaReemplazo}
              AND (l.periodo_id < ${periodoOrigenId}
                OR (l.periodo_id = ${periodoOrigenId}
                  AND EXTRACT(MONTH FROM l.fecha) < ${params.mesOrigen ?? fechaReemplazo.getMonth() + 1}))
            ORDER BY l.periodo_id DESC, EXTRACT(MONTH FROM l.fecha) DESC,
              l.fecha DESC, l.lectura_id DESC
          ) eligible
          ORDER BY fecha DESC, lectura_id DESC
          LIMIT ${limitMonths}
        `;

              if (pastReadings.length > 0) {
                const sum = pastReadings.reduce(
                  (acc, curr) =>
                    acc.plus(new Decimal(curr.consumo_calculado.toString())),
                  new Decimal(0),
                );
                promedioCalculado = sum
                  .dividedBy(pastReadings.length)
                  .toDecimalPlaces(2);
                consumoFacturableSaliente = promedioCalculado;
              } else {
                // Fallback a 0 si no hay lecturas pasadas
                const baseTariff = new Decimal(0);
                promedioCalculado = baseTariff;
                consumoFacturableSaliente = baseTariff;
              }
            } else if (tratamientoSaliente === 'COBRO_PARCIAL') {
              if (porcentajeCobro) {
                const pct = new Decimal(porcentajeCobro.toString()).dividedBy(
                  100,
                );
                consumoFacturableSaliente = consumoMedidoSaliente
                  .mul(pct)
                  .toDecimalPlaces(2);
              } else {
                consumoFacturableSaliente = consumoMedidoSaliente;
              }
            }

            // 6. Preserve the physical segment that began at the previous replacement.
            const previousReplacement = await tx.reemplazoMedidor.findFirst({
              where: {
                historialEntranteId: openHistorial.historialId,
                deletedAt: null,
              },
            });
            if (previousReplacement) {
              await tx.reemplazoMedidor.update({
                where: { reemplazoId: previousReplacement.reemplazoId },
                data: {
                  consumoMedidoEntrante: new Prisma.Decimal(
                    consumoMedidoSaliente.toString(),
                  ),
                  consumoFacturableEntrante:
                    previousReplacement.tratamientoEntrante ===
                    'FACTURAR_PERIODO_ACTUAL'
                      ? new Prisma.Decimal(consumoFacturableSaliente.toString())
                      : new Prisma.Decimal(0),
                  consumoDiferidoEntrante:
                    previousReplacement.tratamientoEntrante ===
                    'DIFERIR_SIGUIENTE_PERIODO'
                      ? new Prisma.Decimal(consumoFacturableSaliente.toString())
                      : new Prisma.Decimal(0),
                },
              });
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
                historialMedidorId: openHistorial.historialId,
                periodoId: periodoOrigenId,
                fecha: fechaReemplazo,
                lecturaAnterior: new Prisma.Decimal(
                  baseReadingSaliente.toString(),
                ),
                lecturaActual: new Prisma.Decimal(finalSalienteDec.toString()),
                consumoCalculado: new Prisma.Decimal(
                  consumoMedidoSaliente.toString(),
                ),
                estado: requiereAprobacion ? 'POR_REVISION' : 'APROBADA',
              },
            });

            // 8. Cerrar historial saliente
            await tx.historialMedidores.update({
              where: { historialId: openHistorial.historialId },
              data: {
                fechaHasta: fechaReemplazo,
                lecturaFinal: new Prisma.Decimal(finalSalienteDec.toString()),
                motivo: `${motivo}${detalleMotivo ? ': ' + detalleMotivo : ''}`,
                actualizadoPor: solicitadoPorUsuarioId.toString(),
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
            const initialEntranteDec = new Decimal(
              lecturaInicialEntrante.toString(),
            );
            const nuevoHistorial = await tx.historialMedidores.create({
              data: {
                contratoId,
                medidorId: nuevoMedidorId,
                fechaDesde: fechaReemplazo,
                lecturaInicial: new Prisma.Decimal(
                  initialEntranteDec.toString(),
                ),
                motivo: 'Instalación por reemplazo',
                creadoPor: solicitadoPorUsuarioId.toString(),
              },
            });

            // 11. Registrar lectura física inicial del entrante
            const lecturaInicialRecord = await tx.lecturas.create({
              data: {
                medidorId: nuevoMedidorId,
                historialMedidorId: nuevoHistorial.historialId,
                periodoId: periodoOrigenId,
                fecha: fechaReemplazo,
                lecturaAnterior: new Prisma.Decimal(
                  initialEntranteDec.toString(),
                ),
                lecturaActual: new Prisma.Decimal(
                  initialEntranteDec.toString(),
                ),
                consumoCalculado: new Prisma.Decimal('0'),
                estado: requiereAprobacion ? 'POR_REVISION' : 'APROBADA',
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
                  descripcion: contrato.categoriaTarifa.descripcion ?? null,
                  consumoMinimoMensual:
                    contrato.categoriaTarifa.consumoMinimoMensual ?? null,
                  fechaVigenciaDesde:
                    contrato.categoriaTarifa.fechaVigenciaDesde?.toISOString() ??
                    null,
                  fechaVigenciaHasta:
                    contrato.categoriaTarifa.fechaVigenciaHasta?.toISOString() ??
                    null,
                  rubros: (contrato.categoriaTarifa.rubros || []).map((r) => ({
                    rubroId: r.rubroId,
                    codigoSri: r.codigoSri ?? null,
                    nombre: r.nombre,
                    descripcion: r.descripcion,
                    precioUnitario: r.precioUnitario.toString(),
                    tipoRubro: r.tipoRubro,
                    codigoSistemaRubro: r.codigoSistemaRubro ?? null,
                    esAutomatico: r.esAutomatico,
                    tarifaImpuestoId: r.tarifaImpuestoId,
                  })),
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
                tarifaOrigenSnapshot:
                  tarifaSnapshot === null
                    ? Prisma.JsonNull
                    : (tarifaSnapshot satisfies Prisma.InputJsonObject),
                estado: 'PENDIENTE',
                estadoAprobacion: requiereAprobacion ? 'PENDIENTE' : 'APROBADA',
                solicitadoPorUsuarioId,
                autorizadoPorUsuarioId: requiereAprobacion
                  ? null
                  : (autorizadoPorUsuarioId ?? solicitadoPorUsuarioId),
                autorizadoEn: requiereAprobacion
                  ? null
                  : (autorizadoEn ?? fechaReemplazo),
                claveIdempotencia,
                huellaSolicitud,
                creadoPor: solicitadoPorUsuarioId.toString(),
              },
            });

            return this.toReplaceMeterResult(reemplazoRecord);
          },
          {
            isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
            timeout: 15000,
            maxWait: 10000,
          },
        );
      } catch (error) {
        const retryable =
          error instanceof Prisma.PrismaClientKnownRequestError &&
          (error.code === 'P2034' || error.code === 'P2002');
        if (retryable && attempt < maxAttempts) continue;
        if (retryable) {
          throw new ConflictException(
            'El contrato fue modificado concurrentemente; reintente la operación',
          );
        }
        throw error;
      }
    }
    throw new ConflictException('No se pudo completar el reemplazo');
  }

  async approveReplacement(
    params: ApproveMeterReplacementRepositoryData,
  ): Promise<ReplaceMeterResult> {
    return this.prisma.$transaction(
      async (tx) => {
        const replacement = await tx.reemplazoMedidor.findUnique({
          where: { reemplazoId: params.reemplazoId },
        });
        if (!replacement || replacement.deletedAt) {
          throw new EntityNotFoundException(
            'Reemplazo de medidor',
            params.reemplazoId,
          );
        }
        if (
          replacement.solicitadoPorUsuarioId === params.autorizadoPorUsuarioId
        ) {
          throw new ConflictException(
            'Los tratamientos excepcionales requieren un autorizador distinto del solicitante',
          );
        }
        if (replacement.estadoAprobacion === 'APROBADA') {
          return this.toReplaceMeterResult(replacement);
        }
        if (replacement.estadoAprobacion !== 'PENDIENTE') {
          throw new ConflictException(
            'El reemplazo no está pendiente de aprobación',
          );
        }

        await tx.lecturas.updateMany({
          where: {
            lecturaId: {
              in: [
                replacement.lecturaFinalSalienteId,
                replacement.lecturaInicialEntranteId,
              ].filter((id): id is bigint => id !== null),
            },
          },
          data: { estado: 'APROBADA', fechaValidacion: new Date() },
        });
        const approved = await tx.reemplazoMedidor.update({
          where: { reemplazoId: params.reemplazoId },
          data: {
            estadoAprobacion: 'APROBADA',
            autorizadoPorUsuarioId: params.autorizadoPorUsuarioId,
            autorizadoEn: new Date(),
            actualizadoPor: params.autorizadoPorUsuarioId.toString(),
          },
        });
        return this.toReplaceMeterResult(approved);
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  }

  async findHistoryByMeter(medidorId: bigint): Promise<MeterHistoryEntity[]> {
    const rows = await this.prisma.historialMedidores.findMany({
      where: { medidorId, deletedAt: null },
      orderBy: { fechaDesde: 'desc' },
      include: {
        medidor: true,
        contrato: { include: { cliente: true } },
        reemplazosSaliente: { select: { reemplazoId: true } },
        reemplazosEntrante: { select: { reemplazoId: true } },
      },
    });
    return MeterHistoryMapper.toDomainList(rows);
  }

  async findReplacementById(
    reemplazoId: bigint,
  ): Promise<ReemplazoMedidorEntity | null> {
    const record = await this.prisma.reemplazoMedidor.findFirst({
      where: { reemplazoId, deletedAt: null },
    });
    return ReemplazoMedidorMapper.toDomain(record);
  }

  private toReplaceMeterResult(
    replacement: Prisma.ReemplazoMedidorGetPayload<object>,
  ): ReplaceMeterResult {
    return {
      reemplazo: ReemplazoMedidorMapper.toDomain(replacement)!,
      historialSalienteId: replacement.historialSalienteId,
      historialEntranteId: replacement.historialEntranteId,
      consumoMedidoSaliente: new Decimal(
        replacement.consumoMedidoSaliente.toString(),
      ),
      consumoFacturableSaliente: new Decimal(
        replacement.consumoFacturableSaliente.toString(),
      ),
      consumoDiferidoEntrante: new Decimal(
        replacement.consumoDiferidoEntrante.toString(),
      ),
    };
  }
}
