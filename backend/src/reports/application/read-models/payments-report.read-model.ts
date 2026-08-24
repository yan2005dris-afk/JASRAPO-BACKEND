export interface PaymentsReportFilters {
  fechaDesde?: string;
  fechaHasta?: string;
  clienteId?: string;
}

export interface PaymentDetailReadModel {
  invoiceNumber: string | null;
  billedPeriodName: string | null;
  contractId: string | null;
  meterSerial: string | null;
  amount: number;
}

export interface PaymentReadModel {
  paymentDate: Date;
  client: {
    nombres: string | null;
    apellidos: string | null;
    razonSocial: string | null;
  };
  details: PaymentDetailReadModel[];
}

export interface PaymentsReportReadModel {
  payments: PaymentReadModel[];
  filters: PaymentsReportFilters;
  recipientEmail: string | null;
  generatedAt: Date;
}

export interface PaymentsReportGroupRow {
  emision: string;
  valor: string;
}

export interface PaymentsReportGroup {
  factura: string;
  fecha: string;
  clienteNombre: string;
  cuenta: string;
  medidor: string;
  filas: PaymentsReportGroupRow[];
  subtotal: string;
}

export interface PaymentsReportDocument {
  reporte: {
    titulo: string;
    fechaDesde: string;
    fechaHasta: string;
    fechaEmision: string;
    grupos: PaymentsReportGroup[];
    totalGeneral: string;
    totalRegistros: number;
  };
}
