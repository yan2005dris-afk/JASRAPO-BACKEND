export interface IResponseClient {
  clienteId: bigint;
  identificacion: string;
  nombres: string;
  apellidos: string;
  razonSocial: string | null;
  email: string | null;
  telefono: string | null;
  telefonoSecundario: string | null;
  direccionDomicilio: string | null;
  activo: boolean;
  aplicaDiscapacidad: boolean;
  aplicaTerceraEdad: boolean;
  tipoIdentificacion: {
    id: number;
    codigo: string;
    descripcion: string;
  } | null;
}
