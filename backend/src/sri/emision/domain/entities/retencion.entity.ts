import { InfoTributaria, InfoRetencion, ImpuestoRetenido, CampoAdicional } from '../interfaces';

export class RetencionEntity {
  id?: string;
  version: string;
  infoTributaria: InfoTributaria;
  infoRetencion: InfoRetencion;
  impuestos: ImpuestoRetenido[];
  infoAdicional?: CampoAdicional[];

  constructor(partial: Partial<RetencionEntity>) {
    Object.assign(this, partial);
    this.version = partial.version || '2.0.0';
  }
}
