import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { ContractRepository } from '../../domain/repositories/contract.repository';
import { ContractEntity } from '../../domain/entities/contract.entity';
import { CreateContractData } from '../../domain/types/create-contract-data';
import { CreateContractWithMeterCommand } from '../../domain/types/create-contract-with-meter-command';
import { ContractMapper } from '../mappers/contract.mapper';

@Injectable()
export class PrismaContractRepository implements ContractRepository {
  private readonly defaultInclude = {
    categoriaTarifa: true,
    cliente: true,
    comunidad: true,
    sector: true,
    historialMedidores: {
      include: { medidor: true },
    },
  } satisfies Prisma.ContratosInclude;

  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateContractData): Promise<ContractEntity> {
    const record = await this.prisma.contratos.create({
      data: data as Prisma.ContratosUncheckedCreateInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record)!;
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Record<string, any>;
    orderBy?: Record<string, any>;
  }): Promise<ContractEntity[]> {
    const records = await this.prisma.contratos.findMany({
      skip: params.skip,
      take: params.take,
      where: (params.where ?? {}) as Prisma.ContratosWhereInput,
      orderBy: params.orderBy as Prisma.ContratosOrderByWithRelationInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomainList(records);
  }

  async findUnique(where: Record<string, any>): Promise<ContractEntity | null> {
    const record = await this.prisma.contratos.findUnique({
      where: where as Prisma.ContratosWhereUniqueInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record);
  }

  async count(params: { where?: Record<string, any> }): Promise<number> {
    return this.prisma.contratos.count({
      where: params.where as Prisma.ContratosWhereInput,
    });
  }

  async update(
    where: Record<string, any>,
    data: Record<string, any>,
  ): Promise<ContractEntity> {
    const record = await this.prisma.contratos.update({
      where: where as Prisma.ContratosWhereUniqueInput,
      data: data as Prisma.ContratosUpdateInput,
      include: this.defaultInclude,
    });
    return ContractMapper.toDomain(record)!;
  }

  // ── Domain-level transactional operations ──────────────────────────────

  async createContractWithMeterHistory(
    data: CreateContractWithMeterCommand,
  ): Promise<ContractEntity> {
    return this.prisma.$transaction(async (tx) => {
      await this.validateContractDependencies(tx, data);

      const contrato = await tx.contratos.create({
        data: {
          clienteId: data.clienteId,
          categoriaTarifaId: data.categoriaTarifaId,
          numeroGuia: data.numeroGuia,
          direccionSuministro: data.direccionSuministro,
          comunidadId: data.comunidadId,
          estado: data.estado as any,
          ...(data.sectorId !== null ? { sectorId: data.sectorId } : {}),
          ...(data.creadoPor ? { creadoPor: data.creadoPor } : {}),
        },
      });

      await tx.historialMedidores.create({
        data: {
          medidorId: data.medidorId,
          contratoId: contrato.contratoId,
          lecturaInicial: new Prisma.Decimal(data.lecturaInicial),
          motivo: 'VINCULACION MANUAL',
        },
      });

      return this.findUnique({ contratoId: contrato.contratoId }) as Promise<ContractEntity>;
    });
  }

  async replaceMeterInContract(
    contractId: bigint,
    newMeterId: bigint,
    lecturaInicial: number,
    contractFields?: Record<string, any>,
  ): Promise<ContractEntity> {
    return this.prisma.$transaction(async (tx) => {
      const medidor = await tx.medidores.findUnique({
        where: { medidorId: newMeterId },
      });
      if (!medidor) {
        throw new NotFoundException(
          `Medidor con ID ${newMeterId} no encontrado`,
        );
      }

      await tx.historialMedidores.updateMany({
        where: { contratoId: contractId, fechaHasta: null },
        data: { fechaHasta: new Date() },
      });

      await tx.historialMedidores.create({
        data: {
          medidorId: newMeterId,
          contratoId: contractId,
          lecturaInicial: new Prisma.Decimal(lecturaInicial),
          motivo: 'REEMPLAZO',
        },
      });

      if (contractFields && Object.keys(contractFields).length > 0) {
        await tx.contratos.update({
          where: { contratoId: contractId },
          data: contractFields,
        });
      }

      return this.findUnique({ contratoId: contractId }) as Promise<ContractEntity>;
    });
  }

  async finalizeActiveMeterLink(contratoId: bigint): Promise<ContractEntity> {
    return this.prisma.$transaction(async (tx) => {
      const activeLink = await tx.historialMedidores.findFirst({
        where: { contratoId, fechaHasta: null },
      });

      if (!activeLink) {
        throw new NotFoundException(
          'No hay un vínculo activo para este contrato',
        );
      }

      await tx.historialMedidores.update({
        where: { historialId: activeLink.historialId },
        data: { fechaHasta: new Date() },
      });

      const medidor = await tx.medidores.findUnique({
        where: { medidorId: activeLink.medidorId },
      });

      if (!medidor) {
        throw new NotFoundException(
          `Medidor con ID ${activeLink.medidorId} no encontrado`,
        );
      }

      return this.findUnique({ contratoId }) as Promise<ContractEntity>;
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private async validateContractDependencies(
    tx: Prisma.TransactionClient,
    data: CreateContractWithMeterCommand,
  ): Promise<void> {
    const cliente = await tx.clientes.findUnique({
      where: { clienteId: data.clienteId },
    });
    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${data.clienteId} no encontrado`,
      );
    }

    const medidor = await tx.medidores.findUnique({
      where: { medidorId: data.medidorId },
    });
    if (!medidor) {
      throw new NotFoundException(
        `Medidor con ID ${data.medidorId} no encontrado`,
      );
    }

    const tarifa = await tx.categoriaTarifa.findUnique({
      where: { categoriaTarifaId: data.categoriaTarifaId },
    });
    if (!tarifa) {
      throw new NotFoundException(
        `Categoría de tarifa con ID ${data.categoriaTarifaId} no encontrada`,
      );
    }

    const comunidad = await tx.comunidades.findUnique({
      where: { comunidadId: data.comunidadId },
    });
    if (!comunidad) {
      throw new NotFoundException(
        `Comunidad con ID ${data.comunidadId} no encontrada`,
      );
    }

    if (data.sectorId !== null) {
      const sector = await tx.sectores.findUnique({
        where: { sectorId: data.sectorId },
      });
      if (!sector) {
        throw new NotFoundException(
          `Sector con ID ${data.sectorId} no encontrado`,
        );
      }
    }
  }
}
