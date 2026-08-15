import type { InstallmentEntity } from './installment.entity';

export class AgreementEntity {
  convenioId: bigint;
  contratoId: bigint;
  numeroCuotas: number;
  abonoInicial: number;
  deudaTotal: number;
  mesesMoraActual: number;
  estado: string;
  fechaAprobacion: Date | null;
  fechaPrimerPago: Date;
  fechaProximoPago: Date | null;
  montoPagadoActual: number;
  motivo: string | null;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  cuotas?: InstallmentEntity[];

  constructor(partial: Partial<AgreementEntity>) {
    Object.assign(this, partial);
  }
}
