import { BadRequestException, Injectable } from '@nestjs/common';
import { BusquedaPublicaRepository } from '../../domain/repositories/busqueda-publica.repository';
import { ISearchFilters } from '../../domain/types/public-search-filters';

@Injectable()
export class PublicSearchUseCase {
  constructor(private readonly searchRepository: BusquedaPublicaRepository) {}

  async execute(tipo: string, valor: string, page = 1, limit = 10) {
    if (!tipo || !valor) {
      throw new BadRequestException('Debe enviar tipo y valor');
    }

    const { skip, take, page: safePage } = this.getPagination(page, limit);
    const isIdent = this.esIdentificacion(valor);
    const filters: ISearchFilters = { valor, isIdent };

    if (tipo === 'cliente') {
      const [clientes, total] = await Promise.all([
        this.searchRepository.findManyClientes(filters, skip, take),
        this.searchRepository.countClientes(filters),
      ]);

      return {
        data: clientes,
        meta: { total, page: safePage, limit: take },
      };
    }

    if (tipo === 'contrato') {
      const [contratos, total] = await Promise.all([
        this.searchRepository.findManyContratos(filters, skip, take),
        this.searchRepository.countContratos(filters),
      ]);

      return {
        data: contratos,
        meta: { total, page: safePage, limit: take },
      };
    }

    if (tipo === 'global') {
      const [clientes, contratos] = await Promise.all([
        this.searchRepository.findManyClientes(filters, 0, 5),
        this.searchRepository.findManyContratos(filters, 0, 5),
      ]);

      const data = [...clientes, ...contratos];

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

  private getPagination(page = 1, limit = 10) {
    const safeLimit = Math.min(limit, 50);
    const safePage = page < 1 ? 1 : page;
    return {
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
      page: safePage,
    };
  }
}
