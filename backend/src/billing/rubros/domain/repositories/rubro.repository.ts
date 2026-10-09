import type { RubroRow } from '../types/rubro.types';
import type {
  CreateRubroData,
  UpdateRubroData,
  RubroFilters,
  RubroFindManyParams,
  TarifaImpuestoInfo,
} from '../types/rubro.types';

export abstract class RubroRepository {
  abstract create(data: CreateRubroData): Promise<RubroRow>;

  abstract findAll(params: RubroFindManyParams): Promise<RubroRow[]>;

  abstract count(params: { where?: RubroFilters }): Promise<number>;

  abstract findById(id: number): Promise<RubroRow | null>;

  abstract findByCategoriaTarifaId(
    categoriaTarifaId: number,
  ): Promise<RubroRow[]>;

  abstract findByCodigoSri(codigoSri: string): Promise<RubroRow | null>;

  abstract update(id: number, data: UpdateRubroData): Promise<RubroRow>;

  abstract delete(id: number): Promise<RubroRow>;

  abstract countPrefacturaDetalleReferences(rubroId: number): Promise<number>;

  abstract findTarifasImpuesto(): Promise<TarifaImpuestoInfo[]>;
}
