import { Prisma } from '../../src/generated/prisma/client';
import {
  EstadoNovedadOrden,
  TipoNovedadOrden,
  EstadoEjecucionOrden,
} from '../../src/generated/prisma/enums';
import {
  EstadoNovedadOrden as SharedState,
  TipoNovedadOrden as SharedType,
  EstadoEjecucionOrden as SharedExecutionState,
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
const capturedExecution: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  ordenTrabajoId: 1n,
  resultadoObservacion: 'Unicode ✓\nmultiline observation',
  evidenciaFotoUrl: 'objects/work-orders/1/photo.webp',
};
const snapshotSelection = {
  lecturaSnapshotId: true,
  lecturaSnapshotAnterior: true,
  lecturaSnapshotActual: true,
  lecturaSnapshotConsumo: true,
  lecturaSnapshotFecha: true,
  lecturaSnapshotInicial: true,
  lecturaSnapshotMedidorId: true,
  lecturaSnapshotPeriodoId: true,
} satisfies Prisma.EjecucionesOrdenTrabajoSelect;
type SnapshotInput = Pick<
  Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput,
  keyof typeof snapshotSelection
>;
const snapshotPopulated = {
  lecturaSnapshotId: 3n,
  lecturaSnapshotAnterior: new Prisma.Decimal('9007199254740993.123456789'),
  lecturaSnapshotActual: new Prisma.Decimal('9007199254740994.123456789'),
  lecturaSnapshotConsumo: new Prisma.Decimal('0.000000000000000000123'),
  lecturaSnapshotFecha: new Date('2026-02-03T04:05:06.123Z'),
  lecturaSnapshotInicial: false,
  lecturaSnapshotMedidorId: 77n,
  lecturaSnapshotPeriodoId: 202602,
} satisfies SnapshotInput;
const snapshotNull = {
  lecturaSnapshotId: null,
  lecturaSnapshotAnterior: null,
  lecturaSnapshotActual: null,
  lecturaSnapshotConsumo: null,
  lecturaSnapshotFecha: null,
  lecturaSnapshotInicial: null,
  lecturaSnapshotMedidorId: null,
  lecturaSnapshotPeriodoId: null,
} satisfies SnapshotInput;
const snapshotCases = [snapshotPopulated, snapshotNull, {}] as const;
const snapshotCreates = snapshotCases.map((snapshot) => ({
  ordenTrabajoId: 1n,
  ...snapshot,
})) satisfies Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput[];
const snapshotCheckedCreates = snapshotCases.map((snapshot) => ({
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
  ...snapshot,
})) satisfies Prisma.EjecucionesOrdenTrabajoCreateInput[];
const snapshotCheckedUpdates = snapshotCases.map((snapshot) => ({
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
  ...snapshot,
})) satisfies Prisma.EjecucionesOrdenTrabajoUpdateInput[];
const snapshotUncheckedUpdates =
  snapshotCases satisfies readonly Prisma.EjecucionesOrdenTrabajoUncheckedUpdateInput[];
type SnapshotResult = Prisma.EjecucionesOrdenTrabajoGetPayload<{
  select: typeof snapshotSelection;
}>;
type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
type Assert<T extends true> = T;
type SnapshotTypes = Assert<
  Equal<
    SnapshotResult,
    {
      lecturaSnapshotId: bigint | null;
      lecturaSnapshotAnterior: Prisma.Decimal | null;
      lecturaSnapshotActual: Prisma.Decimal | null;
      lecturaSnapshotConsumo: Prisma.Decimal | null;
      lecturaSnapshotFecha: Date | null;
      lecturaSnapshotInicial: boolean | null;
      lecturaSnapshotMedidorId: bigint | null;
      lecturaSnapshotPeriodoId: number | null;
    }
  >
>;
const snapshotResult: SnapshotResult = { ...snapshotPopulated };
const snapshotResultNull: SnapshotResult = { ...snapshotNull };
const invalidSnapshotDecimal = {
  ordenTrabajoId: 1n,
  // @ts-expect-error decimal input rejects booleans
  lecturaSnapshotAnterior: true,
} satisfies Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput;
const invalidSnapshotBigInt = {
  ordenTrabajoId: 1n,
  // @ts-expect-error BigInt input rejects strings
  lecturaSnapshotMedidorId: '77',
} satisfies Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput;
const invalidSnapshotInt = {
  ordenTrabajoId: 1n,
  // @ts-expect-error Int input rejects bigint
  lecturaSnapshotPeriodoId: 202602n,
} satisfies Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput;
const invalidSnapshotBoolean = {
  ordenTrabajoId: 1n,
  // @ts-expect-error boolean input rejects strings
  lecturaSnapshotInicial: 'false',
} satisfies Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput;
const invalidSnapshotDate = {
  ordenTrabajoId: 1n,
  // @ts-expect-error DateTime input rejects numbers
  lecturaSnapshotFecha: 42,
} satisfies Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput;
// @ts-expect-error result decimal fields must be Decimal or null
const invalidSnapshotResultValue: SnapshotResult['lecturaSnapshotActual'] = {};
type InvalidSnapshotSelection =
  // @ts-expect-error selection rejects unknown fields
  Prisma.EjecucionesOrdenTrabajoSelect['notAField'];
const capturedSelection = {
  resultadoObservacion: true,
  evidenciaFotoUrl: true,
} satisfies Prisma.EjecucionesOrdenTrabajoSelect;
type CapturedResult = Prisma.EjecucionesOrdenTrabajoGetPayload<{
  select: typeof capturedSelection;
}>;
const capturedResultString: CapturedResult = {
  resultadoObservacion: 'observed',
  evidenciaFotoUrl: 'objects/photo.webp',
};
const capturedResultNull: CapturedResult = {
  resultadoObservacion: null,
  evidenciaFotoUrl: null,
};
const capturedResultFields: {
  resultadoObservacion: string | null;
  evidenciaFotoUrl: string | null;
} = capturedResultString;
const explicitNullCapturedExecution: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput =
  {
    ordenTrabajoId: 1n,
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
  };
const capturedUpdate: Prisma.EjecucionesOrdenTrabajoUncheckedUpdateInput = {
  resultadoObservacion: 'updated',
  evidenciaFotoUrl: 'objects/updated-photo.webp',
};
const omittedUpdate: Prisma.EjecucionesOrdenTrabajoUncheckedUpdateInput = {
  ordenTrabajoId: 1n,
};
const nullableCapturedExecution: Prisma.EjecucionesOrdenTrabajoUncheckedUpdateInput =
  {
    resultadoObservacion: null,
    evidenciaFotoUrl: null,
  };
const invalidCapturedObservationUpdate: Prisma.EjecucionesOrdenTrabajoUncheckedUpdateInput =
  {
    // @ts-expect-error update observation rejects inappropriate numeric values
    resultadoObservacion: 42,
  };
const invalidCapturedEvidenceUpdate: Prisma.EjecucionesOrdenTrabajoUncheckedUpdateInput =
  {
    // @ts-expect-error update evidence rejects inappropriate numeric values
    evidenciaFotoUrl: 42,
  };
const legacyExecution: Prisma.EjecucionesOrdenTrabajoCreateInput = {
  ordenTrabajo: { connect: { ordenTrabajoId: 1n } },
};
const draftExecution: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  ordenTrabajoId: 1n,
  estado: EstadoEjecucionOrden.DRAFT,
  creadoPorUsuarioId: 10,
  propietarioUsuarioId: 11,
  version: 1,
};
const submittedExecution: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  ordenTrabajoId: 2n,
  estado: EstadoEjecucionOrden.SUBMITTED,
  creadoPorUsuarioId: 10,
  propietarioUsuarioId: 11,
  enviadoPorUsuarioId: 12,
  enviadoEn: new Date('2026-01-01T00:00:00.000Z'),
  version: 2,
};
const canceledExecution: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  ordenTrabajoId: 3n,
  estado: EstadoEjecucionOrden.CANCELED,
  creadoPorUsuarioId: 10,
  propietarioUsuarioId: 11,
  canceladoEn: new Date('2026-01-02T00:00:00.000Z'),
  version: 1,
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

const executionParity: {
  [K in keyof typeof EstadoEjecucionOrden]: (typeof EstadoEjecucionOrden)[K];
} = SharedExecutionState;
type GeneratedExecutionKeys = keyof typeof EstadoEjecucionOrden;
type SharedExecutionKeys = keyof typeof SharedExecutionState;
const noExtraSharedExecutionKeys: Record<
  Exclude<SharedExecutionKeys, GeneratedExecutionKeys>,
  never
> = {};
void [
  valid,
  optionalLinks,
  withProvenance,
  draftExecution,
  submittedExecution,
  canceledExecution,
  legacyUpsert,
  capturedExecution,
  snapshotCreates,
  snapshotCheckedCreates,
  snapshotCheckedUpdates,
  snapshotUncheckedUpdates,
  snapshotResult,
  nullableCapturedExecution,
  capturedSelection,
  capturedResultString,
  capturedResultNull,
  capturedResultFields,
  explicitNullCapturedExecution,
  capturedUpdate,
  omittedUpdate,
  allTypes,
  allStates,
  [
    EstadoEjecucionOrden.LEGACY_UNKNOWN,
    EstadoEjecucionOrden.DRAFT,
    EstadoEjecucionOrden.SUBMITTED,
    EstadoEjecucionOrden.CANCELED,
  ],
  executionParity,
  noExtraSharedExecutionKeys,
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
const invalidCapturedExecution: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput =
  {
    ordenTrabajoId: 1n,
    // @ts-expect-error captured content fields reject inappropriate numeric values
    resultadoObservacion: 42,
  };
const invalidCapturedEvidence: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput =
  {
    ordenTrabajoId: 1n,
    // @ts-expect-error captured content fields reject inappropriate numeric values
    evidenciaFotoUrl: 42,
  };
const bigintCreator: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  // @ts-expect-error Prisma Int actor fields reject bigint values
  creadoPorUsuarioId: 10n,
  ordenTrabajoId: 1n,
};
const bigintOwner: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  // @ts-expect-error Prisma Int actor fields reject bigint values
  propietarioUsuarioId: 10n,
  ordenTrabajoId: 1n,
};
const bigintSubmitter: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  // @ts-expect-error Prisma Int actor fields reject bigint values
  enviadoPorUsuarioId: 10n,
  ordenTrabajoId: 1n,
};
const stringOrderId: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  // @ts-expect-error Prisma BigInt IDs reject string values
  ordenTrabajoId: '1',
};
const stringExecutionId: Prisma.EjecucionesOrdenTrabajoUncheckedCreateInput = {
  // @ts-expect-error Prisma BigInt IDs reject string values
  ejecucionId: '1',
  ordenTrabajoId: 1n,
};
void [
  missingOrder,
  missingReporter,
  missingResponsible,
  bigintCreator,
  bigintOwner,
  bigintSubmitter,
  stringOrderId,
  stringExecutionId,
  invalidCapturedExecution,
  invalidCapturedEvidence,
  invalidCapturedObservationUpdate,
  invalidCapturedEvidenceUpdate,
];
