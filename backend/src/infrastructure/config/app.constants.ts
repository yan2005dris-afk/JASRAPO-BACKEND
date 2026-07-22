const DEFAULT_SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export const REFRESH_TOKEN_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export const TRUST_PROXY_HOPS = 1;
export const TRUST_PROXY_KEY = 'trust proxy' as const;

export const SESSION_TTL_SECONDS = DEFAULT_SESSION_TTL_SECONDS;

/**
 * PROTECCIÓN CONTRA FUERZA BRUTA EN LOGIN (issue #136)
 *
 * Umbral y ventana deslizante: tras LOGIN_LOCKOUT_THRESHOLD fallos dentro de
 * LOGIN_LOCKOUT_WINDOW_MS, la cuenta queda bloqueada durante
 * LOGIN_LOCKOUT_DURATION_MS. El contador se reinicia al hacer login exitoso
 * o cuando la ventana deslizante expira sin nuevos intentos fallidos.
 */
export const LOGIN_LOCKOUT_THRESHOLD = 5;
export const LOGIN_LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
export const LOGIN_LOCKOUT_DURATION_MS = 30 * 60 * 1000;

/**
 * CONFIGURACIÓN DE CARGA DE ARCHIVOS
 */
const parsedUploadSize = parseInt(process.env.MAX_UPLOAD_SIZE_MB || '5', 10);
export const MAX_UPLOAD_SIZE_MB =
  Number.isFinite(parsedUploadSize) && parsedUploadSize > 0
    ? parsedUploadSize
    : 5;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

import { EstadoMedidor, EstadoLote } from 'src/shared/enums';
import { buildStateCatalog } from 'src/shared/enums/state-catalog';

/**
 * ESTADOS DE MEDIDOR (generado desde enum Prisma)
 */
const METER_STATE_NAMES: Record<EstadoMedidor, string> = {
  [EstadoMedidor.BODEGA]: 'En Bodega',
  [EstadoMedidor.INSTALADO]: 'Instalado',
  [EstadoMedidor.DANADO]: 'Dañado',
  [EstadoMedidor.PENDIENTE]: 'Pendiente',
  [EstadoMedidor.BAJA]: 'Dado de Baja',
};

export const METER_STATUS_LIST = buildStateCatalog(
  EstadoMedidor,
  METER_STATE_NAMES,
);

/**
 * ESTADOS DE LOTE (generado desde enum Prisma)
 */
const BATCH_STATE_NAMES: Record<EstadoLote, string> = {
  [EstadoLote.BORRADOR]: 'Borrador',
  [EstadoLote.DEFINITIVO]: 'Definitivo',
  [EstadoLote.ENVIADO]: 'Enviado',
};

export const BATCH_STATUS_LIST = buildStateCatalog(
  EstadoLote,
  BATCH_STATE_NAMES,
);
