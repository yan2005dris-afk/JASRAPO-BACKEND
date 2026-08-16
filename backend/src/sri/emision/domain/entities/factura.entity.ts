import { Factura, InfoTributaria, InfoFactura, DetalleFactura, TotalImpuesto, CampoAdicional } from '../interfaces';

export class FacturaEntity {
  id?: string;
  version: string;
  infoTributaria: InfoTributaria;
  infoFactura: InfoFactura;
  detalles: DetalleFactura[];
  infoAdicional?: CampoAdicional[];

  constructor(partial: Partial<FacturaEntity>) {
    Object.assign(this, partial);
    this.version = partial.version || '2.1.0';
  }

  get totalConImpuestos(): TotalImpuesto[] {
    return this.infoFactura?.totalConImpuestos || [];
  }

  get total(): number {
    return this.infoFactura?.importeTotal || 0;
  }

  get claveAcceso(): string {
    return this.infoTributaria?.claveAcceso || '';
  }
}
