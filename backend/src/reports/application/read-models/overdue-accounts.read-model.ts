export interface OverdueAccountsReportFilters {
  contratoId?: string;
  clienteId?: string;
  sectorId?: string;
  fechaCorte?: string;
}

export interface OverdueInvoiceReadModel {
  contractId: string;
  guideNumber: string;
  clientName: string;
  identification: string;
  sectorName: string;
  meterSerial: string;
  outstandingBalance: number;
  billedPeriodName: string;
}

export interface OverdueAccountsReportReadModel {
  invoices: OverdueInvoiceReadModel[];
  cutoffDate: Date;
}

export interface OverdueAccountItem {
  contratoId: string;
  numeroGuia: string;
  clienteNombre: string;
  identificacion: string;
  sectorNombre: string;
  mesesVencidos: number;
  saldoPendiente: string;
  saldoPendienteNum: number;
  ultimaEmision: string;
  medidorSerie: string;
}

export interface OverdueAccountsReportDocument {
  data: OverdueAccountItem[];
  meta: {
    total: number;
    fechaCorte: string;
  };
  kpis: {
    totalMorosidad: string;
    totalMorosos: number;
    mayorDeuda: string;
  };
}
