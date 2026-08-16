export class SecuencialEntity {
  id: number;
  emisorId: number;
  puntoEmisionId: number;
  tipoComprobante: string;
  secuencialActual: number;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<SecuencialEntity>) {
    Object.assign(this, partial);
  }

  getFormattedSecuencial(): string {
    return String(this.secuencialActual).padStart(9, '0');
  }
}
