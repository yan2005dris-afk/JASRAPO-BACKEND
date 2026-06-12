import { Injectable } from '@nestjs/common';
import { PublicSearchUseCase } from './use-cases/public-search.use-case';
import { SearchDeudaPublicaUseCase } from './use-cases/search-deuda-publica.use-case';
import type { TipoBusquedaDeuda } from '../domain/types/debt-search.types';

@Injectable()
export class BusquedaPublicaService {
  constructor(
    private readonly publicSearchUseCase: PublicSearchUseCase,
    private readonly searchDeudaPublicaUseCase: SearchDeudaPublicaUseCase,
  ) {}

  async search(tipo: string, valor: string, page = 1, limit = 10) {
    return this.publicSearchUseCase.execute(tipo, valor, page, limit);
  }

  async searchDeuda(
    tipo: TipoBusquedaDeuda,
    valor: string,
    page = 1,
    limit = 10,
  ) {
    return this.searchDeudaPublicaUseCase.execute(tipo, valor, page, limit);
  }
}
