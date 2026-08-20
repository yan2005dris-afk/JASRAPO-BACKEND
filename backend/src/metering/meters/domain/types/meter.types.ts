import type { MeterEntity } from '../entities/meter.entity';
import type { ReemplazoMedidorEntity } from '../entities/reemplazo-medidor.entity';
import type { Decimal } from 'decimal.js';
import type {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
} from 'src/shared/enums';

export interface MeterFilters {
  estado?: MeterEntity['estado'];
  marca?: string;
  modelo?: string;
  serie?: string;
  search?: string;
}

export interface CreateMeterRepositoryData {
  marca: string;
  modelo: string;
  serie: string;
  estado: MeterEntity['estado'];
  latitud?: number | null;
  longitud?: number | null;
}

export interface UpdateMeterRepositoryData {
  marca?: string;
  modelo?: string;
  serie?: string;
  estado?: MeterEntity['estado'];
  fechaInstalacion?: Date | null;
  fechaBaja?: Date | null;
  motivo?: string | null;
  latitud?: number | null;
  longitud?: number | null;
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
  solicitadoPorUsuarioId?: string;
  autorizadoPorUsuarioId?: string;
  autorizadoEn?: Date;
  fechaReemplazo?: Date;
}

export interface ReplaceMeterResult {
  reemplazo: ReemplazoMedidorEntity;
  historialSalienteId: bigint;
  historialEntranteId: bigint;
  consumoMedidoSaliente: Decimal;
  consumoFacturableSaliente: Decimal;
  consumoDiferidoEntrante: Decimal;
}
