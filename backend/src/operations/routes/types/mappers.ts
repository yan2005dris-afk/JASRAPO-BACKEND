import type { Prisma } from 'src/generated/prisma/client';
import { RouteEntity } from './route.entity';
import { ReadingForRouteEntity } from './reading-for-route.entity';
import { DateUtil } from 'src/infrastructure/common/utils/date.util';

type RouteModel = Prisma.RutasGetPayload<{}>;

type ReadingWithRelations = Prisma.LecturasGetPayload<{
  include: {
    medidor: {
      include: {
        historial: {
          include: {
            contrato: {
              include: {
                cliente: true;
                sector: true;
              };
            };
          };
        };
      };
    };
  };
}>;

export class RouteMapper {
  static toEntity(route: RouteModel): RouteEntity {
    return new RouteEntity({
      rutaId: route.rutaId,
      nombre: route.nombre,
      descripcion: route.descripcion,
      operarioId: route.operarioId,
      tipoRuta: route.tipoRuta,
      comunidadId: route.comunidadId,
      sectorId: route.sectorId,
      fechaPlanificada: DateUtil.formatForFrontend(route.createdAt),
      fechaInicio: DateUtil.formatForFrontend(route.fechaInicio),
      fechaFin: DateUtil.formatForFrontend(route.fechaFin),
      estado: route.estado,
    });
  }
}

export class ReadingForRouteMapper {
  static toEntity(lectura: ReadingWithRelations): ReadingForRouteEntity {
    // Current contract is the one in history with fechaHasta: null
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
