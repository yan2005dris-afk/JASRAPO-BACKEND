import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import {
  MeterRepository,
  CreateMeterRepositoryData,
  UpdateMeterRepositoryData,
  CreateMeterHistoryRepositoryData,
  MeterFilters,
} from '../../domain/repositories/meter.repository';
import { MeterEntity } from '../../domain/entities/meter.entity';
import { MeterMapper } from '../mappers/meter.mapper';

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
    });
    return MeterMapper.toDomain(record);
  }

  async findMany(params: {
    where?: MeterFilters;
    take?: number;
    skip?: number;
  }): Promise<MeterEntity[]> {
    const whereClause: Prisma.MedidoresWhereInput = {
      deletedAt: null,
      ...(params.where?.estado && { estado: params.where.estado as any }),
    };

    const records = await this.prisma.medidores.findMany({
      where: whereClause,
      take: params.take,
      skip: params.skip,
      orderBy: { createdAt: 'desc' },
    });
    return MeterMapper.toDomainList(records);
  }

  async create(data: CreateMeterRepositoryData): Promise<MeterEntity> {
    const record = await this.prisma.medidores.create({
      data: {
        marca: data.marca,
        modelo: data.modelo,
        serie: data.serie,
        estado: data.estado as any,
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
        ...(data.estado !== undefined && { estado: data.estado as any }),
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
}
