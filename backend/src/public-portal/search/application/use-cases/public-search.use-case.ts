import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import { BusquedaPublicaMapper } from '../../domain/types/busqueda-publica.mapper';

@Injectable()
export class PublicSearchUseCase {
  constructor(private readonly searchRepository: BusquedaPublicaRepository) {}

  async execute(tipo: string, valor: string, page = 1, limit = 10) {
    if (!tipo || !valor) {
      throw new BadRequestException('Debe enviar tipo y valor');
    }

    const { skip, take, page: safePage } = this.getPagination(page, limit);
    const isIdent = this.esIdentificacion(valor);
    const tokens = this.normalizarBusqueda(valor);

    if (tipo === 'cliente') {
      const whereCliente = this.buildWhereCliente(isIdent, valor, tokens);
      const [clientes, total] = await Promise.all([
        this.searchRepository.findManyClientes({
          where: whereCliente,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
        this.searchRepository.countClientes({ deletedAt: null }),
      ]);

      return {
        data: clientes.map(BusquedaPublicaMapper.cliente),
        meta: { total, page: safePage, limit: take },
      };
    }

    if (tipo === 'contrato') {
      const whereContrato: Prisma.ContratosWhereInput = {
        numeroGuia: { contains: valor, mode: 'insensitive' },
        deletedAt: null,
        cliente: { deletedAt: null },
      };
      const [contratos, total] = await Promise.all([
        this.searchRepository.findManyContratos({
          where: whereContrato,
          include: { cliente: true },
          skip,
          take,
        }),
        this.searchRepository.countContratos({ deletedAt: null }),
      ]);

      return {
        data: contratos.map(BusquedaPublicaMapper.contrato),
        meta: { total, page: safePage, limit: take },
      };
    }

    if (tipo === 'global') {
      const whereGlobal = this.buildWhereCliente(isIdent, valor, tokens);
      const [clientes, contratos] = await Promise.all([
        this.searchRepository.findManyClientes({ where: whereGlobal, skip: 0, take: 5 }),
        this.searchRepository.findManyContratos({
          where: {
            numeroGuia: { contains: valor, mode: 'insensitive' },
            deletedAt: null,
            cliente: { deletedAt: null },
          },
          include: { cliente: true },
          skip: 0,
          take: 5,
        }),
      ]);

      const data = [
        ...clientes.map(BusquedaPublicaMapper.cliente),
        ...contratos.map(BusquedaPublicaMapper.contrato),
      ];

      return {
        data,
        meta: { total: data.length, page: 1, limit: data.length },
      };
    }

    throw new BadRequestException('Tipo de búsqueda inválido');
  }

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
    };
  }

  private buildWhereCliente(
    isIdent: boolean,
    valor: string,
    tokens: string[],
  ): Prisma.ClientesWhereInput {
    if (isIdent) {
      return { identificacion: valor.trim(), deletedAt: null };
    }
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
}
