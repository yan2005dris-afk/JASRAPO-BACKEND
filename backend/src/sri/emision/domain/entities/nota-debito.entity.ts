import type {
  InfoTributaria,
  InfoNotaDebito,
  MotivoNotaDebito,
  TotalImpuesto,
  CampoAdicional,
} from '../interfaces';

export class NotaDebitoEntity {
  id?: string;
  version: string;
  infoTributaria: InfoTributaria;
  infoNotaDebito: InfoNotaDebito;
  motivos: MotivoNotaDebito[];
  impuestos: TotalImpuesto[];
  infoAdicional?: CampoAdicional[];

  constructor(partial: Partial<NotaDebitoEntity>) {
    Object.assign(this, partial);
    this.version = partial.version || '1.0.0';
  }
}
