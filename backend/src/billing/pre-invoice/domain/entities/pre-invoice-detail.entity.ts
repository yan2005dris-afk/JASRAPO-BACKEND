export class PreInvoiceDetailEntity {
  prefacturaDetalleId: number;
  prefacturaId: bigint;
  rubroId: number;
  descripcion: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  iva: number;
  total: number;
  descuento: number;
  tarifaImpuesto: number;
  codigoImpuestoSri?: string | null;
  codigoPorcentajeSri?: string | null;
  rubroNombre?: string | null;

  constructor(partial: Partial<PreInvoiceDetailEntity>) {
    Object.assign(this, partial);
  }
}
