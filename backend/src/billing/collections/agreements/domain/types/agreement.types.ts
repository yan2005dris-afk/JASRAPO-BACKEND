export interface AgreementFilters {
  contratoId?: string | bigint;
  search?: string;
}

export interface CreateInstallmentData {
  numeroCuota: number;
  valorCuota: number;
  saldoPendiente: number;
  fechaVencimiento: Date;
  estado: string;
  montoPagado: number;
  diasRetraso: number;
  interesMoraAplicado: number;
  pagoCompleto: boolean;
}

export interface CreateAgreementData {
  contratoId: bigint;
  numeroCuotas: number;
  abonoInicial: number;
  deudaTotal: number;
  mesesMoraActual: number;
  estado: string;
  fechaPrimerPago: Date;
  fechaProximoPago: Date;
  montoPagadoActual: number;
  motivo?: string | null;
}

export interface PrefacturaDeudaRaw {
  prefacturaId: bigint;
  periodoId: number;
  totalPagar: number;
  abono: number;
  estado: string;
  createdAt: Date;
}

export interface PaymentAgreementReportReadModel {
  convenio: {
    convenioId: string;
    contratoId: string;
    deudaTotal: number;
    abonoInicial: number;
    numeroCuotas: number;
    fechaPrimerPago: string;
    periodoInicio: string;
    motivo: string | null;
    createdAt: string;
    cuotaMensual: number;
    primeraCuota: number;
    contrato: {
      numeroGuia: string;
      direccionSuministro: string;
    };
    cliente: {
      nombres: string;
      apellidos: string;
      razonSocial: string | null;
      identificacion: string;
      email: string | null;
    };
  };
}
