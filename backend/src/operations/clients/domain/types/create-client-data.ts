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
