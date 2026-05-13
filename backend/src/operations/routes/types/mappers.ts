import type { Prisma } from 'src/generated/prisma/client';
import { RouteEntity } from './route.entity';
import { ReadingForRouteEntity } from './reading-for-route.entity';
import { DateUtil } from 'src/infrastructure/common/util/date.util';

type RouteModel = Prisma.RutasGetPayload<{}>;

type ReadingWithRelations = Prisma.LecturasGetPayload<{
  include: {
    contrato: {
      include: {
        cliente: true;
        sector: true;
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
    const cliente = lectura.contrato?.cliente;

    const clienteNombre = cliente
      ? [cliente.nombres, cliente.apellidos].filter(Boolean).join(' ').trim()
      : 'Sin cliente';

    return new ReadingForRouteEntity({
      lecturaId: lectura.lecturaId,

      guia: lectura.contrato?.numeroGuia ?? 'Sin guía',

      clienteNombre,

      direccion: lectura.contrato?.direccionSuministro ?? 'Sin dirección',

      sector: lectura.contrato?.sector?.nombre ?? 'Sin sector',

      estadoContrato: lectura.contrato?.estado ?? 'DESCONOCIDO',
    });
  }
}
