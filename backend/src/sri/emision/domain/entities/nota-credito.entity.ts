import { InfoTributaria, InfoNotaCredito, DetalleNotaCredito, CampoAdicional } from '../interfaces';

export class NotaCreditoEntity {
  id?: string;
  version: string;
  infoTributaria: InfoTributaria;
  infoNotaCredito: InfoNotaCredito;
  detalles: DetalleNotaCredito[];
  infoAdicional?: CampoAdicional[];

  constructor(partial: Partial<NotaCreditoEntity>) {
    Object.assign(this, partial);
    this.version = partial.version || '1.1.0';
  }

  get documentoModificado(): string {
    return this.infoNotaCredito?.numDocModificado || '';
  }

  get motivo(): string {
    return this.infoNotaCredito?.motivo || '';
  }
}
