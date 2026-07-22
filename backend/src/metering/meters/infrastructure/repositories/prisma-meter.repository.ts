import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  MeterRepository,
  CreateMeterRepositoryData,
  UpdateMeterRepositoryData,
  CreateMeterHistoryRepositoryData,
} from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { MeterMapper } from '../mappers/meter.mapper';
import { MeterFilters } from '../../domain/types/meter-filters';

@Injectable()
export class PrismaMeterRepository implements MeterRepository {
  constructor(private readonly prisma: PrismaService) {}

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
  }

  async update(
    where: { medidorId: bigint },
    data: UpdateMeterRepositoryData,
    tx?: any,
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
    tx?: any,
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

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
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
}
