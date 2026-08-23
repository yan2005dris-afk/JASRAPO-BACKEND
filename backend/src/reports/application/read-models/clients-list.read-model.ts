export interface ClientsListReportFilters {
  identificacion?: string;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  activo?: boolean | string;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface ClientListItemReadModel {
  identificacion: string;
  nombres: string;
  apellidos: string;
  razonSocial: string | null;
  email: string | null;
  telefono: string | null;
  direccionDomicilio: string | null;
  activo: boolean;
  tipoIdentificacion: { descripcion: string } | null;
}

export interface ClientsListReportReadModel {
  clients: ClientListItemReadModel[];
  filters: ClientsListReportFilters;
  generatedAt: Date;
}

export interface ClientsListReportRow {
  identificacion: string;
  nombre: string;
  email: string;
  telefono: string;
  direccion: string;
  activo: 'Activo' | 'Inactivo';
  tipoId: string;
}

export interface ClientsListReportDocument {
  reporte: {
    titulo: string;
    fecha: string;
    filtrosAplicados: string;
    totalClientes: number;
    clientes: ClientsListReportRow[];
  };
}
