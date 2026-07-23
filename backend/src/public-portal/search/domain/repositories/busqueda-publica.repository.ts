import type {
  IClienteConContratosRaw,
  IContratoConDeudaRaw,
  TipoBusquedaDeuda,
} from '../types/debt-search.types';

export abstract class BusquedaPublicaRepository {
  abstract findClientesBy(
    tipo: 'identificacion',
    valor: string,
    skip: number,
    take: number,
  ): Promise<IClienteConContratosRaw[]>;

  abstract countClientesBy(
    tipo: 'identificacion',
    valor: string,
  ): Promise<number>;

  abstract findContratosDeudaBy(
    tipo: TipoBusquedaDeuda,
    valor: string,
    skip: number,
    take: number,
  ): Promise<IContratoConDeudaRaw[]>;

  abstract countContratosDeuda(
    tipo: TipoBusquedaDeuda,
    valor: string,
  ): Promise<number>;
}
