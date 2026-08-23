export interface ConnectionHistoryReportFilters {
  contratoId: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ConnectionHistoryInvoiceReadModel {
  periodName: string | null;
  currentReading: number;
  previousReading: number;
  consumption: number;
  billedAmount: number;
  paidAmount: number;
  outstandingBalance: number;
}

export interface ConnectionHistoryReportReadModel {
  contractId: string;
  client: {
    nombres: string | null;
    apellidos: string | null;
    razonSocial: string | null;
  } | null;
  meterSerial: string | null;
  invoices: ConnectionHistoryInvoiceReadModel[];
  filters: ConnectionHistoryReportFilters;
  recipientEmail: string | null;
  generatedAt: Date;
}

export interface ConnectionHistoryReportRow {
  emision: string;
  lectActual: string;
  lectAnterior: string;
  consumo: string;
  valEmision: string;
  abonos: string;
  saldo: string;
}

export interface ConnectionHistoryReportDocument {
  reporte: {
    titulo: string;
    fechaEmision: string;
    fechaDesde: string;
    fechaHasta: string;
    cuenta: string;
    clienteNombre: string;
    medidor: string;
    filas: ConnectionHistoryReportRow[];
    totalValEmision: string;
    totalAbonos: string;
    saldoFinal: string;
  };
}
