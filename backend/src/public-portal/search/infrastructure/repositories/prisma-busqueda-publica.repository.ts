import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoDeuda, Prisma } from 'src/generated/prisma/client';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import { ISearchFilters } from '../../domain/types/public-search-filters';
import { SearchResultEntity } from '../../domain/entities/public-search-result.entity';
import { BusquedaPublicaMapper } from '../mappers/busqueda-publica.mapper';
import type {
  IContratoConDeudaRaw,
  TipoBusquedaDeuda,
} from '../../domain/types/debt-search.types';

const ESTADOS_DEUDA = Object.values(EstadoDeuda);

@Injectable()
export class PrismaBusquedaPublicaRepository implements BusquedaPublicaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyClientes(
    filters: ISearchFilters,
    skip: number,
    take: number,
  ): Promise<SearchResultEntity[]> {
    const where = this.buildWhereCliente(filters);
    const raw = await this.prisma.clientes.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    });
    return raw.map(BusquedaPublicaMapper.cliente);
  }

  async countClientes(filters: ISearchFilters): Promise<number> {
    const where = this.buildWhereCliente(filters);
    return this.prisma.clientes.count({ where });
  }

  async findManyContratos(
    filters: ISearchFilters,
    skip: number,
    take: number,
  ): Promise<SearchResultEntity[]> {
    const where = this.buildWhereContrato(filters);
    const raw = await this.prisma.contratos.findMany({
      where,
      include: { cliente: true },
      skip,
      take,
    });
    return raw.map(BusquedaPublicaMapper.contrato);
  }

  async countContratos(filters: ISearchFilters): Promise<number> {
    const where = this.buildWhereContrato(filters);
    return this.prisma.contratos.count({ where });
  }

  async findContratosDeudaBy(
    tipo: TipoBusquedaDeuda,
    valor: string,
    skip: number,
    take: number,
  ): Promise<IContratoConDeudaRaw[]> {
    const where = this.buildWhereDeuda(tipo, valor);
    const deudaPrefacturaWhere: Prisma.PrefacturasListRelationFilter = {
      some: {
        deletedAt: null,
        estado: { in: [...ESTADOS_DEUDA] },
      },
    };
    const rows = await this.prisma.contratos.findMany({
      where: { ...where, prefacturas: deudaPrefacturaWhere },
      include: {
        cliente: {
          select: {
            clienteId: true,
            identificacion: true,
            nombres: true,
            apellidos: true,
          },
        },
        prefacturas: {
          where: {
            deletedAt: null,
            estado: { in: [...ESTADOS_DEUDA] },
          },
          select: { totalPagar: true, abono: true, periodoId: true },
        },
      },
      skip,
      take,
      orderBy: { contratoId: 'asc' },
    });

    return rows.map((r) => ({
      contratoId: r.contratoId,
      numeroGuia: r.numeroGuia,
      estado: r.estado,
      cliente: r.cliente,
      prefacturasImpagadas: r.prefacturas,
    }));
  }

  async countContratosDeuda(
    tipo: TipoBusquedaDeuda,
    valor: string,
  ): Promise<number> {
    return this.prisma.contratos.count({
      where: {
        ...this.buildWhereDeuda(tipo, valor),
        prefacturas: {
          some: {
            deletedAt: null,
            estado: { in: [...ESTADOS_DEUDA] },
          },
        },
      },
    });
  }

  private buildWhereDeuda(
    tipo: TipoBusquedaDeuda,
    valor: string,
  ): Prisma.ContratosWhereInput {
    const base: Prisma.ContratosWhereInput = { deletedAt: null };

    if (tipo === 'identificacion') {
      return { ...base, cliente: { identificacion: valor, deletedAt: null } };
    }

    if (tipo === 'numeroGuia') {
      return {
        ...base,
        numeroGuia: { contains: valor, mode: 'insensitive' },
      };
    }

    // tipo === 'nombre'
    const tokens = this.normalizarTokens(valor);
    return {
      ...base,
      cliente: {
        deletedAt: null,
        AND: tokens.map(
          (t): Prisma.ClientesWhereInput => ({
            OR: [
              { nombres: { contains: t, mode: 'insensitive' } },
              { apellidos: { contains: t, mode: 'insensitive' } },
            ],
          }),
        ),
      },
    };
  }

  private buildWhereCliente(filters: ISearchFilters): Prisma.ClientesWhereInput {
    if (filters.isIdent) {
      return { identificacion: filters.valor.trim(), deletedAt: null };
    }

    const tokens = this.normalizarTokens(filters.valor);
    return {
      AND: tokens.map(
        (t): Prisma.ClientesWhereInput => ({
          OR: [
            { nombres: { contains: t, mode: 'insensitive' } },
            { apellidos: { contains: t, mode: 'insensitive' } },
          ],
        }),
      ),
      deletedAt: null,
    };
  }

  private buildWhereContrato(
    filters: ISearchFilters,
  ): Prisma.ContratosWhereInput {
    return {
      numeroGuia: { contains: filters.valor, mode: 'insensitive' },
      deletedAt: null,
      cliente: { deletedAt: null },
    };
  }

  private normalizarTokens(valor: string): string[] {
    return valor
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean);
  }
}
