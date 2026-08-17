import type { TipoRubro } from 'src/generated/prisma/client';

export class RubroEntity {
  rubroId!: number;
  codigoSri!: string | null;
  nombre!: string;
  descripcion!: string;
  precioUnitario!: number;
  tipoRubro!: TipoRubro;
  tarifaImpuestoId!: number;
  tarifaImpuesto?: {
    id: number;
    codigoPorcentaje: string;
    porcentaje: number;
    descripcion: string;
  };
  activo!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt!: Date | null;

  constructor(partial: Partial<RubroEntity>) {
    Object.assign(this, partial);
  }
}
