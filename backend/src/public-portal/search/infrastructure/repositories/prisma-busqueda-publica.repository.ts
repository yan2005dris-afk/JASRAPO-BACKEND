import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { Prisma } from 'src/generated/prisma/client';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import { SearchFilters } from '../../domain/types/public-search-filters';
import { SearchResultEntity } from '../../domain/entities/public-search-result.entity';
import { BusquedaPublicaMapper } from '../mappers/busqueda-publica.mapper';

@Injectable()
export class PrismaBusquedaPublicaRepository implements BusquedaPublicaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyClientes(
    filters: SearchFilters,
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

  async countClientes(filters: SearchFilters): Promise<number> {
    const where = this.buildWhereCliente(filters);
    return this.prisma.clientes.count({ where });
  }

  async findManyContratos(
    filters: SearchFilters,
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

  async countContratos(filters: SearchFilters): Promise<number> {
    const where = this.buildWhereContrato(filters);
    return this.prisma.contratos.count({ where });
  }

  private buildWhereCliente(
    filters: SearchFilters,
  ): Prisma.ClientesWhereInput {
    if (filters.isIdent) {
      return { identificacion: filters.valor.trim(), deletedAt: null };
    }

    const tokens = this.normalizarBusqueda(filters.valor);
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
    filters: SearchFilters,
  ): Prisma.ContratosWhereInput {
    return {
      numeroGuia: { contains: filters.valor, mode: 'insensitive' },
      deletedAt: null,
      cliente: { deletedAt: null },
    };
  }

  private normalizarBusqueda(valor: string): string[] {
    return valor
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean);
  }
}
