import { Injectable } from '@nestjs/common';
import { SearchDeudaPublicaUseCase } from './use-cases/search-deuda-publica.use-case';
import type { TipoBusquedaDeuda } from '../domain/types/debt-search.types';

@Injectable()
export class BusquedaPublicaService {
  constructor(
    private readonly searchDeudaPublicaUseCase: SearchDeudaPublicaUseCase,
  ) {}

  async search(tipo: TipoBusquedaDeuda, valor: string, page = 1, limit = 10) {
    return this.searchDeudaPublicaUseCase.execute(tipo, valor, page, limit);
  }
}
