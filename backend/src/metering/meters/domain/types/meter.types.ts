import type {
  MeterRow,
  MeterHistoryRow,
  ReemplazoMedidorRow,
} from '../../infrastructure/repositories/meter.include';
import type { Decimal } from 'decimal.js';
import type {
  EstadoMedidor,
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
} from 'src/shared/enums';

export type { MeterRow, MeterHistoryRow, ReemplazoMedidorRow };

export interface MeterFilters {
  estado?: EstadoMedidor;
  marca?: string;
  modelo?: string;
  serie?: string;
  search?: string;
}

export interface CreateMeterRepositoryData {
  marca: string;
  modelo: string;
  serie: string;
  estado: EstadoMedidor;
}

export interface UpdateMeterRepositoryData {
  marca?: string;
  modelo?: string;
  serie?: string;
  estado?: EstadoMedidor;
  fechaInstalacion?: Date | null;
  fechaBaja?: Date | null;
  motivo?: string | null;
  deletedAt?: Date | null;
}

export interface CreateMeterHistoryRepositoryData {
  medidorId: bigint;
  contratoId: bigint;
  lecturaInicial: number;
  motivo: string;
  fechaDesde: Date;
}

export interface ReplaceMeterRepositoryData {
  contratoId: bigint;
  nuevoMedidorId: bigint;
  lecturaFinalSaliente: Decimal;
  lecturaInicialEntrante?: Decimal;
  motivo: MotivoReemplazoMedidor;
  responsabilidadDano?: ResponsabilidadDano;
  detalleMotivo?: string;
  tratamientoSaliente: TratamientoSaliente;
  tratamientoEntrante: TratamientoEntrante;
  porcentajeCobro?: Decimal;
  ventanaPromedio?: number;
  periodoOrigenId: number;
  periodoDestinoId?: number;
  mesOrigen?: number;
  mesDestino?: number;
  ordenTrabajoId?: bigint;
  solicitadoPorUsuarioId: number;
  autorizadoPorUsuarioId?: number;
  autorizadoEn?: Date;
  fechaReemplazo?: Date;
  claveIdempotencia: string;
  huellaSolicitud: string;
  requiereAprobacion: boolean;
}

export interface ReplaceMeterResult {
  reemplazo: ReemplazoMedidorRow;
  historialSalienteId: bigint;
  historialEntranteId: bigint;
  consumoMedidoSaliente: Decimal;
  consumoFacturableSaliente: Decimal;
  consumoDiferidoEntrante: Decimal;
}

export interface ApproveMeterReplacementRepositoryData {
  reemplazoId: bigint;
  autorizadoPorUsuarioId: number;
}
