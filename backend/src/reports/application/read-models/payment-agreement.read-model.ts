import type { PaymentAgreementReportReadModel } from 'src/billing/collections/agreements/domain/types/agreement.types';

export interface PaymentAgreementReportFilters {
  convenioId: string;
}

export type { PaymentAgreementReportReadModel };

export interface PaymentAgreementReportDocument {
  convenio: {
    fecha: string;
    numeroGuia: string;
    clienteNombre: string;
    clienteCI: string;
    cuotaMensual: string;
    primeraCuota: string;
    deudaTotal: string;
    abonoInicial: string;
    numeroCuotas: number;
    mesPrimerPago: string;
    periodoInicio: string;
    fechaActual: string;
  };
}
