import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { EstadoMedidor } from 'src/shared/enums';
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

      await tx.medidores.update({
        where: { medidorId: data.medidorId },
        data: { estado: EstadoMedidor.PENDIENTE },
      });

      const createdRecord = await tx.contratos.findUnique({
        where: { contratoId: contrato.contratoId },
        include: this.defaultInclude,
      });
      return ContractMapper.toDomain(createdRecord)!;
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

      const updatedRecord = await tx.contratos.findUnique({
        where: { contratoId: contractId },
        include: this.defaultInclude,
      });
      return ContractMapper.toDomain(updatedRecord)!;
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

      await tx.medidores.update({
        where: { medidorId: activeLink.medidorId },
        data: {
          estado: EstadoMedidor.BAJA,
          fechaBaja: new Date(),
        },
      });

      const finalizedRecord = await tx.contratos.findUnique({
        where: { contratoId },
        include: this.defaultInclude,
      });
      return ContractMapper.toDomain(finalizedRecord)!;
    });
  }

  // ── Private helpers ────────────────────────────────────────────────────

  private async validateContractDependencies(
    tx: Prisma.TransactionClient,
    data: CreateContractWithMeterCommand,
  ): Promise<void> {
    const [cliente, medidor, tarifa, comunidad, sector] = await Promise.all([
      tx.clientes.findUnique({ where: { clienteId: data.clienteId } }),
      tx.medidores.findUnique({ where: { medidorId: data.medidorId } }),
      tx.categoriaTarifa.findUnique({
        where: { categoriaTarifaId: data.categoriaTarifaId },
      }),
      tx.comunidades.findUnique({ where: { comunidadId: data.comunidadId } }),
      data.sectorId !== null
        ? tx.sectores.findUnique({ where: { sectorId: data.sectorId } })
        : Promise.resolve(null),
    ]);

    if (!cliente) {
      throw new NotFoundException(
        `Cliente con ID ${data.clienteId} no encontrado`,
      );
    }

    if (!medidor) {
      throw new NotFoundException(
        `Medidor con ID ${data.medidorId} no encontrado`,
      );
    }

    if (medidor.estado !== EstadoMedidor.BODEGA) {
      throw new BadRequestException(
        `El medidor debe estar en estado BODEGA para ser vinculado, estado actual: ${medidor.estado}`,
      );
    }

    if (!tarifa) {
      throw new NotFoundException(
        `Categoría de tarifa con ID ${data.categoriaTarifaId} no encontrada`,
      );
    }

    if (!comunidad) {
      throw new NotFoundException(
        `Comunidad con ID ${data.comunidadId} no encontrada`,
      );
    }

    if (data.sectorId !== null && !sector) {
      throw new NotFoundException(
        `Sector con ID ${data.sectorId} no encontrado`,
      );
    }
  }
}
