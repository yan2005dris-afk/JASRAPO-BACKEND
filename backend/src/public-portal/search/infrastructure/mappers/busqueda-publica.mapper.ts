import { SearchResultEntity } from '../../domain/entities/public-search-result.entity';

interface ClientesRaw {
  clienteId: number | bigint;
  identificacion: string | null;
  nombres: string | null;
  apellidos: string | null;
  telefono: string | null;
  email: string | null;
}

interface ContratosRaw {
  contratoId: number | bigint;
  numeroGuia: string | null;
  estado: string | null;
  direccionSuministro: string | null;
  cliente: {
    identificacion: string | null;
    nombres: string | null;
    apellidos: string | null;
  } | null;
}

export class BusquedaPublicaMapper {
  static cliente(raw: ClientesRaw): SearchResultEntity {
    const nombre = `${raw.nombres ?? ''} ${raw.apellidos ?? ''}`.trim();

    return new SearchResultEntity('cliente', raw.clienteId.toString(), nombre || 'Sin nombre', {
      identificacion: raw.identificacion ?? null,
      telefono: raw.telefono ?? null,
      email: raw.email ?? null,
    });
  }

  static contrato(raw: ContratosRaw): SearchResultEntity {
    const clienteNombre = raw.cliente
      ? `${raw.cliente.nombres ?? ''} ${raw.cliente.apellidos ?? ''}`.trim()
      : null;

    return new SearchResultEntity(
      'contrato',
      raw.contratoId.toString(),
      raw.numeroGuia ?? 'Sin número de guía',
      {
        cliente: clienteNombre || null,
        identificacionCliente: raw.cliente?.identificacion ?? null,
        estado: raw.estado ?? null,
        direccion: raw.direccionSuministro ?? null,
      },
    );
  }
}
