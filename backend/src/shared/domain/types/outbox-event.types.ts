/**
 * Tipos canónicos y esquemas de eventos para el Outbox transaccional.
 */

export const OUTBOX_EVENTO_TIPO = {
  PAGO_VALIDADO: 'pago.validado',
  CUOTA_PAGADA: 'cuota.pagada',
  PAGO_ANULADO: 'pago.anulado',
} as const;

export type OutboxEventoTipo =
  (typeof OUTBOX_EVENTO_TIPO)[keyof typeof OUTBOX_EVENTO_TIPO];

export interface PagoValidadoPayload {
  pagoId: string | number | bigint;
  estadoPago?: string;
  actualizadoPor?: string;
  creadoPor?: string;
  origen?: string;
}

export interface CuotaPagadaPayload {
  cuotaConvenioId: string | number | bigint;
  pagoId?: string | number | bigint;
  convenioId?: string | number | bigint;
}

export interface PagoAnuladoPayload {
  pagoId: string | number | bigint;
  motivoAnulacion?: string;
  anuladoPor?: string;
}

export type OutboxPayloadMap = {
  [OUTBOX_EVENTO_TIPO.PAGO_VALIDADO]: PagoValidadoPayload;
  [OUTBOX_EVENTO_TIPO.CUOTA_PAGADA]: CuotaPagadaPayload;
  [OUTBOX_EVENTO_TIPO.PAGO_ANULADO]: PagoAnuladoPayload;
};

/**
 * Validador y extractor seguro de BigInt para IDs numéricos en payloads.
 * Evita excepciones no controladas por sintaxis o tipos inválidos.
 */
export function parseRequiredBigInt(value: unknown, fieldName: string): bigint {
  if (value === undefined || value === null || value === '') {
    throw new Error(
      `Payload inválido: campo requerido '${fieldName}' está ausente o vacío`,
    );
  }
  if (typeof value === 'bigint') {
    return value;
  }
  if (typeof value === 'number') {
    if (!Number.isSafeInteger(value)) {
      throw new Error(
        `Payload inválido: '${fieldName}' no es un entero seguro (${value})`,
      );
    }
    return BigInt(value);
  }
  if (typeof value === 'string') {
    try {
      return BigInt(value.trim());
    } catch {
      throw new Error(
        `Payload inválido: '${fieldName}' no tiene formato BigInt válido ("${value}")`,
      );
    }
  }
  throw new Error(
    `Payload inválido: tipo inesperado para '${fieldName}' (${typeof value})`,
  );
}

/**
 * Valida y extrae el payload tipado para 'pago.validado'
 */
export function parsePagoValidadoPayload(payload: Record<string, unknown>): {
  pagoId: bigint;
  estadoPago?: string;
  actualizadoPor?: string;
} {
  const pagoId = parseRequiredBigInt(payload['pagoId'], 'pagoId');
  const estadoPago =
    typeof payload['estadoPago'] === 'string'
      ? payload['estadoPago']
      : undefined;
  const actualizadoPor =
    typeof payload['actualizadoPor'] === 'string'
      ? payload['actualizadoPor']
      : typeof payload['creadoPor'] === 'string'
        ? payload['creadoPor']
        : undefined;

  return { pagoId, estadoPago, actualizadoPor };
}

/**
 * Valida y extrae el payload tipado para 'cuota.pagada'
 */
export function parseCuotaPagadaPayload(payload: Record<string, unknown>): {
  cuotaConvenioId: bigint;
  pagoId?: bigint;
  convenioId?: bigint;
} {
  const cuotaConvenioId = parseRequiredBigInt(
    payload['cuotaConvenioId'],
    'cuotaConvenioId',
  );
  const pagoId =
    payload['pagoId'] !== undefined && payload['pagoId'] !== null
      ? parseRequiredBigInt(payload['pagoId'], 'pagoId')
      : undefined;
  const convenioId =
    payload['convenioId'] !== undefined && payload['convenioId'] !== null
      ? parseRequiredBigInt(payload['convenioId'], 'convenioId')
      : undefined;

  return { cuotaConvenioId, pagoId, convenioId };
}

/**
 * Valida y extrae el payload tipado para 'pago.anulado'
 */
export function parsePagoAnuladoPayload(payload: Record<string, unknown>): {
  pagoId: bigint;
  motivoAnulacion: string;
  anuladoPor?: string;
} {
  const pagoId = parseRequiredBigInt(payload['pagoId'], 'pagoId');
  const motivoAnulacion =
    typeof payload['motivoAnulacion'] === 'string'
      ? payload['motivoAnulacion']
      : '';
  const anuladoPor =
    typeof payload['anuladoPor'] === 'string'
      ? payload['anuladoPor']
      : undefined;

  return { pagoId, motivoAnulacion, anuladoPor };
}
