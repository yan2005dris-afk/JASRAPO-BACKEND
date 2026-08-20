import type { RubroEntity } from '../../../rubros/domain/entities/rubro.entity';

export class TariffCategoryEntity {
  categoriaTarifaId: number;
  nombre: string;
  descripcion: string | null;
  fechaVigenciaDesde: Date | null;
  fechaVigenciaHasta: Date | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  rubros?: RubroEntity[];

  constructor(partial: Partial<TariffCategoryEntity>) {
    Object.assign(this, partial);
  }
}
