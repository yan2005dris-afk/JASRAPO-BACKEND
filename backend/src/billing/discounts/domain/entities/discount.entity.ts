export class DiscountEntity {
  id: number;
  nombre: string;
  descripcion: string | null;
  tipoDescuento: string;
  valor: number;
  esPorcentaje: boolean;
  rubroId: number | null;
  rubro?: { rubroId: number; nombre: string; tipoRubro: string; precioUnitario: any } | null;
  activo: boolean;
  aplicaAutomatico: boolean;

  constructor(partial: Partial<DiscountEntity>) {
    Object.assign(this, partial);
  }
}
