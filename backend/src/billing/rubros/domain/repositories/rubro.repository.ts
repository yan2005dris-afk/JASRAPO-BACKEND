import type { RubroEntity } from '../entities/rubro.entity';
import type {
  CreateRubroData,
  UpdateRubroData,
  RubroFilters,
  RubroFindManyParams,
  TarifaImpuestoInfo,
} from '../types/rubro.types';

export abstract class RubroRepository {
  abstract create(data: CreateRubroData): Promise<RubroEntity>;

  abstract findAll(params: RubroFindManyParams): Promise<RubroEntity[]>;

  abstract count(params: { where?: RubroFilters }): Promise<number>;

  abstract findById(id: number): Promise<RubroEntity | null>;

  abstract findByCodigoSri(codigoSri: string): Promise<RubroEntity | null>;

  abstract update(id: number, data: UpdateRubroData): Promise<RubroEntity>;

  abstract delete(id: number): Promise<RubroEntity>;

  abstract countPrefacturaDetalleReferences(rubroId: number): Promise<number>;

  abstract findTarifasImpuesto(): Promise<TarifaImpuestoInfo[]>;
}
