export interface IAgreementState {
  codigo: string;
  nombre: string;
}

export interface IInstallmentState {
  codigo: string;
  nombre: string;
}

export interface IInstallment {
  cuotaConvenioId: bigint;
  convenioId: bigint;
  numeroCuota: number;
  valorCuota: any;
  fechaVencimiento: Date;
  estado: string;
  fechaPago: Date | null;
  montoPagado: any;
  saldoPendiente: any;
  diasRetraso: number;
  interesMoraAplicado: any;
  pagoCompleto: boolean;
  fechaPagoAnticipado: Date | null;
}

export interface IAgreement {
  convenioId: bigint;
  contratoId: bigint;
  numeroCuotas: number;
  abonoInicial: any;
  deudaTotal: any;
  mesesMoraActual: number;
  estado: string;
  fechaAprobacion: Date | null;
  fechaPrimerPago: Date;
  fechaProximoPago: Date | null;
  montoPagadoActual: any;
  motivo: string | null;
  createdAt: Date;
  cuotaConvenio?: IInstallment[];
}
