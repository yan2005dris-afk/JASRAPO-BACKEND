export class InstallmentEntity {
  cuotaConvenioId: bigint;
  convenioId: bigint;
  numeroCuota: number;
  valorCuota: number;
  fechaVencimiento: Date;
  estado: string;
  fechaPago: Date | null;
  montoPagado: number;
  saldoPendiente: number;
  diasRetraso: number;
  interesMoraAplicado: number;
  pagoCompleto: boolean;
  fechaPagoAnticipado: Date | null;

  constructor(partial: Partial<InstallmentEntity>) {
    Object.assign(this, partial);
  }
}
