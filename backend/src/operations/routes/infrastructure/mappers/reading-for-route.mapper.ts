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
  lecturaAnterior?: any;
  lecturaActual?: any;
  consumoCalculado?: any;
  estado?: string;
  medidor?: {
    serie?: string;
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

    const isPending = lectura.estado === 'PENDIENTE' || Number(lectura.lecturaActual ?? 0) === 0;
    const rawActual = lectura.lecturaActual !== undefined ? Number(lectura.lecturaActual) : 0;
    const rawAnterior = lectura.lecturaAnterior !== undefined ? Number(lectura.lecturaAnterior) : 0;
    const rawConsumo = isPending ? 0 : Math.max(0, rawActual - rawAnterior);

    return new ReadingForRouteEntity({
      lecturaId: lectura.lecturaId,
      guia: contrato?.numeroGuia ?? 'Sin guía',
      clienteNombre,
      direccion: contrato?.direccionSuministro ?? 'Sin dirección',
      sector: contrato?.sector?.nombre ?? 'Sin sector',
      estadoContrato: contrato?.estado ?? 'DESCONOCIDO',
      medidorSerie: lectura.medidor?.serie ?? undefined,
      lecturaAnterior: rawAnterior,
      lecturaActual: isPending ? null as any : rawActual,
      consumoCalculado: rawConsumo,
      estadoLectura: lectura.estado ?? undefined,
    });
  }

  static toEntityList(
    readings: ReadingWithRelationsRaw[],
  ): ReadingForRouteEntity[] {
    return readings.map((r) => ReadingForRouteMapper.toEntity(r));
  }
}
