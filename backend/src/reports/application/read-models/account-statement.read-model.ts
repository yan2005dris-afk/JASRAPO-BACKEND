export interface AccountStatementReportFilters {
  contratoId: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface AccountStatementReadingReadModel {
  date: Date;
  currentReading: number;
  previousReading: number;
  consumption: number;
}

export interface AccountStatementPeriodReadModel {
  periodName: string | null;
  annualPayment: number;
  readings: AccountStatementReadingReadModel[];
}

export interface AccountStatementReportReadModel {
  contractId: string;
  contract: {
    guideNumber: string;
    supplyAddress: string;
    sectorName: string | null;
    tariffName: string | null;
    minimumMonthlyConsumption: number;
    baseValue: number;
    excessValuePerM3: number;
    meterSerial: string | null;
    client: {
      nombres: string | null;
      apellidos: string | null;
      razonSocial: string | null;
      identificacion: string;
      email: string | null;
    };
  } | null;
  periods: AccountStatementPeriodReadModel[];
  generatedAt: Date;
}

export interface AccountStatementMonth {
  mes: string;
  lectActual: string;
  lectAnterior: string;
  consu: string;
  excede: string;
  cargoFijo: string;
  excedenteValor: string;
  total: string;
  intMora: string;
  tasaSeg: string;
  convenio: string;
  totalMes: string;
  pagos: string;
  saldo: string;
}

export interface AccountStatementYear {
  nombre: string;
  meses: AccountStatementMonth[];
  subtotalAnual: string;
  pagos: string;
  saldo: string;
}

export interface AccountStatementReportDocument {
  reporte: {
    titulo: string;
    fechaEmision: string;
    sector: string;
    cuenta: string;
    medidor: string;
    tarifaTipo: string;
    clienteNombre: string;
    clienteIdentificacion: string;
    clienteDireccion: string;
    cargoFijo: string;
    factor: string;
    years: AccountStatementYear[];
    deudaTotal: string;
  };
}
