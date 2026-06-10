import { Injectable } from '@nestjs/common';
import { PublicSearchUseCase } from '../use-cases/public-search.use-case';

@Injectable()
export class BusquedaPublicaService {
  constructor(private readonly publicSearchUseCase: PublicSearchUseCase) {}

  async search(tipo: string, valor: string, page = 1, limit = 10) {
    return this.publicSearchUseCase.execute(tipo, valor, page, limit);
  }
}
