import type { Prisma } from '../../src/generated/prisma/client';
import {
  EstadoNovedadOrden,
  TipoNovedadOrden,
} from '../../src/generated/prisma/enums';
import {
  EstadoNovedadOrden as SharedState,
  TipoNovedadOrden as SharedType,
} from '../../src/shared/enums';

const valid: Prisma.NovedadesOrdenTrabajoCreateInput = {
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
  reportadoPor: { connect: { usuarioId: 10 } },
  responsable: { connect: { usuarioId: 11 } },
  tipo: TipoNovedadOrden.FUGA,
  estado: EstadoNovedadOrden.PENDIENTE,
  observacion: 'Leak observed',
};
const optionalLinks: Prisma.NovedadesOrdenTrabajoUncheckedCreateInput = {
  ordenTrabajoId: 1n,
  lecturaId: null,
  ejecucionId: null,
  reportadoPorUsuarioId: 10,
  responsableUsuarioId: 11,
  tipo: TipoNovedadOrden.FUGA,
  observacion: 'No provenance links',
};
const withProvenance: Prisma.NovedadesOrdenTrabajoUncheckedCreateInput = {
  ordenTrabajoId: 1n,
  ejecucionId: 2n,
  lecturaId: 3n,
  reportadoPorUsuarioId: 10,
  responsableUsuarioId: 11,
  tipo: TipoNovedadOrden.OTRO,
  observacion: 'Bound to execution and reading',
};
const legacyExecution: Prisma.EjecucionesOrdenTrabajoCreateInput = {
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
};
const legacyUpsert: Prisma.EjecucionesOrdenTrabajoUpsertArgs = {
  where: { ordenTrabajoId: 1n },
  create: legacyExecution,
  update: {},
};
const allTypes: TipoNovedadOrden[] = [
  TipoNovedadOrden.FUGA,
  TipoNovedadOrden.MEDIDOR_DAÑADO,
  TipoNovedadOrden.LECTURA_ERRONEA,
  TipoNovedadOrden.OTRO,
];
const allStates: EstadoNovedadOrden[] = [
  EstadoNovedadOrden.PENDIENTE,
  EstadoNovedadOrden.EN_SEGUIMIENTO,
  EstadoNovedadOrden.RESUELTA,
];
const sharedTypes: Record<keyof typeof TipoNovedadOrden, TipoNovedadOrden> = {
  FUGA: SharedType.FUGA,
  MEDIDOR_DAÑADO: SharedType.MEDIDOR_DAÑADO,
  LECTURA_ERRONEA: SharedType.LECTURA_ERRONEA,
  OTRO: SharedType.OTRO,
};
const sharedStates: Record<
  keyof typeof EstadoNovedadOrden,
  EstadoNovedadOrden
> = {
  PENDIENTE: SharedState.PENDIENTE,
  EN_SEGUIMIENTO: SharedState.EN_SEGUIMIENTO,
  RESUELTA: SharedState.RESUELTA,
};
const collection: Prisma.EjecucionesOrdenTrabajoCreateInput = {
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
  novedades: { connect: [{ novedadId: 1n }] },
};

void [
  valid,
  optionalLinks,
  withProvenance,
  legacyUpsert,
  allTypes,
  allStates,
  sharedTypes,
  sharedStates,
  collection,
];

// @ts-expect-error order ownership is required
const missingOrder: Prisma.NovedadesOrdenTrabajoCreateInput = {
  reportadoPor: { connect: { usuarioId: 10 } },
  responsable: { connect: { usuarioId: 11 } },
  tipo: TipoNovedadOrden.OTRO,
  observacion: 'invalid',
};
// @ts-expect-error reporter ownership is required
const missingReporter: Prisma.NovedadesOrdenTrabajoCreateInput = {
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
  responsable: { connect: { usuarioId: 11 } },
  tipo: TipoNovedadOrden.OTRO,
  observacion: 'invalid',
};
// @ts-expect-error responsible ownership is required
const missingResponsible: Prisma.NovedadesOrdenTrabajoCreateInput = {
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
  reportadoPor: { connect: { usuarioId: 10 } },
  tipo: TipoNovedadOrden.OTRO,
  observacion: 'invalid',
};
void [missingOrder, missingReporter, missingResponsible];
