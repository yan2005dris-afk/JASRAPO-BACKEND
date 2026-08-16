import { Ambiente, TipoEmision } from '../../../emision/domain/constants';

export class EmisorEntity {
  id: number;
  ruc: string;
  razonSocial: string;
  nombreComercial?: string | null;
  direccionMatriz: string;
  contribuyenteEspecial?: string | null;
  obligadoContabilidad: boolean;
  contribuyenteRimpe?: boolean;
  regimenRimpe?: string | null;
  agenteRetencion?: string | null;
  ambiente: Ambiente | string;
  tipoEmision: TipoEmision | string;
  certificadoPath?: string | null;
  certificadoPassword?: string | null;
  certificadoVencimiento?: Date | null;
  logoPath?: string | null;
  activo: boolean;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<EmisorEntity>) {
    Object.assign(this, partial);
  }

  isCertificadoVigente(): boolean {
    if (!this.certificadoVencimiento) return false;
    return new Date() < new Date(this.certificadoVencimiento);
  }
}
