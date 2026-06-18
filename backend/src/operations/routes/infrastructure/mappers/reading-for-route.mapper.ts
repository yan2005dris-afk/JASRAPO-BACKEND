import { ReadingForRouteEntity } from '../../domain/entities/reading-for-route.entity';

export interface ReadingHistoryRaw {
  fechaHasta: Date | null;
  contrato?: {
    numeroGuia?: string | null;
    direccionSuministro?: string | null;
    estado?: string | null;
    cliente?: { nombres?: string | null; apellidos?: string | null } | null;
    sector?: { nombre?: string | null } | null;
  } | null;
}

export interface ReadingWithRelationsRaw {
  lecturaId: bigint;
  medidor?: {
    historial?: ReadingHistoryRaw[];
  } | null;
}

export class ReadingForRouteMapper {
  static toEntity(lectura: ReadingWithRelationsRaw): ReadingForRouteEntity {
    const activeHistory = lectura.medidor?.historial?.find(
      (h) => h.fechaHasta === null,
    );
    const contrato = activeHistory?.contrato;
    const cliente = contrato?.cliente;

    const clienteNombre = cliente
      ? [cliente.nombres, cliente.apellidos].filter(Boolean).join(' ').trim()
      : 'Sin cliente';

    return new ReadingForRouteEntity({
      lecturaId: lectura.lecturaId,
      guia: contrato?.numeroGuia ?? 'Sin guía',
      clienteNombre,
      direccion: contrato?.direccionSuministro ?? 'Sin dirección',
      sector: contrato?.sector?.nombre ?? 'Sin sector',
      estadoContrato: contrato?.estado ?? 'DESCONOCIDO',
    });
  }
}
