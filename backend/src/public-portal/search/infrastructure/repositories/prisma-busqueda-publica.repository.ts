import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { EstadoDeuda, Prisma } from 'src/generated/prisma/client';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import type {
  IClienteConContratosRaw,
  IContratoConDeudaRaw,
  TipoBusquedaDeuda,
} from '../../domain/types/debt-search.types';

const ESTADOS_DEUDA = Object.values(EstadoDeuda);

@Injectable()
export class PrismaBusquedaPublicaRepository implements BusquedaPublicaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findClientesBy(
    tipo: 'identificacion' | 'nombre',
    valor: string,
    skip: number,
    take: number,
  ): Promise<IClienteConContratosRaw[]> {
    const where = this.buildWhereCliente(tipo, valor);
    const rows = await this.prisma.clientes.findMany({
      where,
      include: {
        contratos: {
          where: { deletedAt: null },
          include: {
            prefacturas: {
              where: {
                deletedAt: null,
                estado: { in: [...ESTADOS_DEUDA] },
              },
              select: { totalPagar: true, abono: true, periodoId: true },
            },
          },
          orderBy: { contratoId: 'asc' },
        },
      },
      skip,
      take,
      orderBy: { clienteId: 'asc' },
    });

    return rows.map((r) => ({
      clienteId: r.clienteId,
      identificacion: r.identificacion,
      nombres: r.nombres,
      apellidos: r.apellidos,
      contratos: r.contratos.map((c) => ({
        contratoId: c.contratoId,
        numeroGuia: c.numeroGuia,
        estado: c.estado,
        prefacturasImpagadas: c.prefacturas,
      })),
    }));
  }

  async countClientesBy(
    tipo: 'identificacion' | 'nombre',
    valor: string,
  ): Promise<number> {
    return this.prisma.clientes.count({
      where: this.buildWhereCliente(tipo, valor),
    });
  }

  async findContratosDeudaBy(
    tipo: TipoBusquedaDeuda,
    valor: string,
    skip: number,
    take: number,
  ): Promise<IContratoConDeudaRaw[]> {
    const where = this.buildWhereDeuda(tipo, valor);
    const rows = await this.prisma.contratos.findMany({
      where,
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
      where: this.buildWhereDeuda(tipo, valor),
    });
  }

  private buildWhereCliente(
    tipo: 'identificacion' | 'nombre',
    valor: string,
  ): Prisma.ClientesWhereInput {
    if (tipo === 'identificacion') {
      return { identificacion: valor, deletedAt: null };
    }
    // tipo === 'nombre'
    const tokens = this.normalizarTokens(valor);
    return {
      deletedAt: null,
      AND: tokens.map(
        (t): Prisma.ClientesWhereInput => ({
          OR: [
            { nombres: { contains: t, mode: 'insensitive' } },
            { apellidos: { contains: t, mode: 'insensitive' } },
          ],
        }),
      ),
    };
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

  private normalizarTokens(valor: string): string[] {
    return valor
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean);
  }
}
