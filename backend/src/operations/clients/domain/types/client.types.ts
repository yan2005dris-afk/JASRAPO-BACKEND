export interface ClientFilters {
  identificacion?: string;
  nombres?: string;
  apellidos?: string;
  nombreCompleto?: string;
  activo?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface CreateClientData {
  identificacion: string;
  tipoIdentificacionId: number;
  nombres: string;
  apellidos: string;
  razonSocial?: string | null;
  email?: string | null;
  telefono?: string | null;
  telefonoSecundario?: string | null;
  direccionDomicilio?: string | null;
  aplicaTerceraEdad: boolean;
  aplicaDiscapacidad: boolean;
}

export type UpdateClientData = Partial<CreateClientData> & {
  deletedAt?: Date | null;
};

export interface ConsumidorFinalData {
  email?: string | null;
  telefono?: string | null;
  telefonoSecundario?: string | null;
  direccionDomicilio?: string | null;
}

export interface IdentificationTypeRef {
  id: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
}
