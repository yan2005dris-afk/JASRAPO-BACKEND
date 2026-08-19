import type {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
  EstadoResolucionConsumo,
} from 'src/shared/enums';
import type { Decimal } from 'decimal.js';

export class ReemplazoMedidorEntity {
  reemplazoId: bigint;
  contratoId: bigint;
  historialSalienteId: bigint;
  historialEntranteId: bigint;
  lecturaFinalSalienteId?: bigint | null;
  lecturaInicialEntranteId?: bigint | null;
  ordenTrabajoId?: bigint | null;
  periodoOrigenId: number;
  periodoDestinoId?: number | null;
  motivo: MotivoReemplazoMedidor;
  responsabilidadDano: ResponsabilidadDano;
  detalleMotivo?: string | null;
  tratamientoSaliente: TratamientoSaliente;
  tratamientoEntrante: TratamientoEntrante;
  consumoMedidoSaliente: Decimal;
  consumoFacturableSaliente: Decimal;
  consumoMedidoEntrante: Decimal;
  consumoFacturableEntrante: Decimal;
  consumoDiferidoEntrante: Decimal;
  ventanaPromedio?: number | null;
  promedioCalculado?: Decimal | null;
  porcentajeCobro?: Decimal | null;
  tarifaOrigenSnapshot?: Record<string, unknown> | null;
  prefacturaDetalleSalienteId?: bigint | null;
  prefacturaDetalleEntranteId?: bigint | null;
  estado: EstadoResolucionConsumo;
  solicitadoPorUsuarioId?: string | null;
  autorizadoPorUsuarioId?: string | null;
  autorizadoEn?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
  creadoPor?: string | null;
  actualizadoPor?: string | null;

  constructor(partial: Partial<ReemplazoMedidorEntity>) {
    Object.assign(this, partial);
  }
}
