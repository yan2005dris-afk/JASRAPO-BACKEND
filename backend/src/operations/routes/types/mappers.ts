import type { Prisma } from 'src/generated/prisma/client';
import { RouteEntity } from './route.entity';
import { ReadingForRouteEntity } from './reading-for-route.entity';

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
      fechaPlanificada: route.fechaPlanificada,
      estado: route.estado,
      createdAt: route.createdAt,
      updatedAt: route.updatedAt,
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
