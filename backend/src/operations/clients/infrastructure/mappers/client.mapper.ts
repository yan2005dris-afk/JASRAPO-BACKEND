import { ClientEntity } from '../../domain/entities/client.entity';

export class ClientMapper {
  static toDomain(raw: any): ClientEntity | null {
    if (!raw) return null;
    return new ClientEntity({
      clienteId: raw.clienteId,
      identificacion: raw.identificacion,
      nombres: raw.nombres,
      apellidos: raw.apellidos,
      razonSocial: raw.razonSocial,
      email: raw.email,
      telefono: raw.telefono,
      telefonoSecundario: raw.telefonoSecundario,
      direccionDomicilio: raw.direccionDomicilio,
      activo: raw.activo,
      aplicaDiscapacidad: raw.aplicaDiscapacidad,
      aplicaTerceraEdad: raw.aplicaTerceraEdad,
      tipoIdentificacion: raw.tipoIdentificacion
        ? {
            id: raw.tipoIdentificacion.id,
            codigo: raw.tipoIdentificacion.codigo,
            descripcion: raw.tipoIdentificacion.descripcion,
          }
        : null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt,
    });
  }

  static toDomainList(rawList: any[]): ClientEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((item): item is ClientEntity => item !== null);
  }
}
