import type { TipoRubro, CodigoSistemaRubro } from '../../../../shared/enums';

export class RubroEntity {
  rubroId!: number;
  codigoSri!: string | null;
  nombre!: string;
  descripcion!: string;
  precioUnitario!: number;
  tipoRubro!: TipoRubro;
  codigoSistemaRubro!: CodigoSistemaRubro | null;
  tarifaImpuestoId!: number;
  categoriaTarifaId!: number | null;
  tarifaImpuesto?: {
    id: number;
    codigoPorcentaje: string;
    porcentaje: number;
    descripcion: string;
  };
  activo!: boolean;
  esAutomatico!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  constructor(partial: Partial<RubroEntity>) {
    Object.assign(this, partial);
  }
}
