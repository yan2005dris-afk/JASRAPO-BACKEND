export class TipoIdentificacionSnippet {
  id: number;

  codigo: string;

  descripcion: string;
}

export class ClientEntity {
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

  porcentajeDiscapacidad: number | null;

  aplicaTerceraEdad: boolean;

  tipoIdentificacion: TipoIdentificacionSnippet | null;

  deletedAt: Date | null;

  createdAt: Date;

  updatedAt: Date;

  constructor(partial: Partial<ClientEntity>) {
    Object.assign(this, partial);
  }
}
