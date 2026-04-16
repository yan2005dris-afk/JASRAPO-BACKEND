import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBusquedaPublicaDto } from './dto/create-busqueda-publica.dto';
import { UpdateBusquedaPublicaDto } from './dto/update-busqueda-publica.dto';
import { PrismaService } from 'src/database/prisma.service';
import { BusquedaPublicaMapper } from './busqueda-publica.mapper';
import { Prisma } from 'src/generated/prisma/client';

@Injectable()
export class BusquedaPublicaService {
  constructor(private prisma: PrismaService) {}

  private esIdentificacion(valor: string): boolean {
    return /^[0-9]{5,20}$/.test(valor.trim());
  }

  private normalizarBusqueda(valor: string): string[] {
    return valor
      .trim()
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(Boolean);
  }

  private getPagination(page = 1, limit = 10) {
    const safeLimit = Math.min(limit, 50);
    const safePage = page < 1 ? 1 : page;

    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      page: safePage,
      limit: safeLimit,
    };
  }

  async search(tipo: string, valor: string, page = 1, limit = 10) {
    if (!tipo || !valor) {
      throw new BadRequestException('Debe enviar tipo y valor');
    }

    const { skip, take, page: safePage } = this.getPagination(page, limit);

    const isIdent = this.esIdentificacion(valor);
    const tokens = this.normalizarBusqueda(valor);

    // =========================================================
    // WHERE CLIENTE (FIX TIPADO SIN TOCAR PRISMA)
    // =========================================================
    let whereCliente: Prisma.ClientesWhereInput;

    if (isIdent) {
      whereCliente = {
        identificacion: valor.trim(),
        deletedAt: null,
      };
    } else {
      whereCliente = {
        AND: tokens.map(
          (t): Prisma.ClientesWhereInput => ({
            OR: [
              {
                nombres: {
                  contains: t,
                  mode: 'insensitive',
                },
              },
              {
                apellidos: {
                  contains: t,
                  mode: 'insensitive',
                },
              },
            ],
          }),
        ),
        deletedAt: null,
      };
    }

    // =========================================================
    // CLIENTE
    // =========================================================
    if (tipo === 'cliente') {
      const [clientes, total] = await this.prisma.$transaction([
        this.prisma.clientes.findMany({
          where: whereCliente,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.clientes.count({
          where: { deletedAt: null },
        }),
      ]);

      return {
        data: clientes.map(BusquedaPublicaMapper.cliente),
        meta: {
          total,
          page: safePage,
          limit: take,
        },
      };
    }

    // =========================================================
    // CONTRATO
    // =========================================================
    if (tipo === 'contrato') {
      const [contratos, total] = await this.prisma.$transaction([
        this.prisma.contratos.findMany({
          where: {
            numeroGuia: {
              contains: valor,
              mode: 'insensitive',
            },
            deletedAt: null,
            cliente: { deletedAt: null },
          },
          include: { cliente: true },
          skip,
          take,
        }),
        this.prisma.contratos.count({
          where: { deletedAt: null },
        }),
      ]);

      return {
        data: contratos.map(BusquedaPublicaMapper.contrato),
        meta: {
          total,
          page: safePage,
          limit: take,
        },
      };
    }

    // =========================================================
    // GLOBAL
    // =========================================================
    if (tipo === 'global') {
      let whereGlobal: Prisma.ClientesWhereInput;

      if (isIdent) {
        whereGlobal = {
          identificacion: valor.trim(),
          deletedAt: null,
        };
      } else {
        whereGlobal = {
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

      const [clientes, contratos] = await Promise.all([
        this.prisma.clientes.findMany({
          where: whereGlobal,
          take: 5,
        }),
        this.prisma.contratos.findMany({
          where: {
            numeroGuia: {
              contains: valor,
              mode: 'insensitive',
            },
            deletedAt: null,
            cliente: { deletedAt: null },
          },
          include: { cliente: true },
          take: 5,
        }),
      ]);

      const data = [
        ...clientes.map(BusquedaPublicaMapper.cliente),
        ...contratos.map(BusquedaPublicaMapper.contrato),
      ];

      return {
        data,
        meta: {
          total: data.length,
          page: 1,
          limit: data.length,
        },
      };
    }

    throw new BadRequestException('Tipo inválido');
  }
}
