import { Decimal } from 'decimal.js';
import { ReemplazoMedidorEntity } from '../../domain/entities/reemplazo-medidor.entity';

export class ReemplazoMedidorMapper {
  static toDomain(raw: any): ReemplazoMedidorEntity | null {
    if (!raw) return null;
    return new ReemplazoMedidorEntity({
      reemplazoId: raw.reemplazoId,
      contratoId: raw.contratoId,
      historialSalienteId: raw.historialSalienteId,
      historialEntranteId: raw.historialEntranteId,
      lecturaFinalSalienteId: raw.lecturaFinalSalienteId ?? null,
      lecturaInicialEntranteId: raw.lecturaInicialEntranteId ?? null,
      ordenTrabajoId: raw.ordenTrabajoId ?? null,
      periodoOrigenId: raw.periodoOrigenId,
      periodoDestinoId: raw.periodoDestinoId ?? null,
      mesOrigen: raw.mesOrigen,
      mesDestino: raw.mesDestino ?? null,
      motivo: raw.motivo,
      responsabilidadDano: raw.responsabilidadDano,
      detalleMotivo: raw.detalleMotivo ?? null,
      tratamientoSaliente: raw.tratamientoSaliente,
      tratamientoEntrante: raw.tratamientoEntrante,
      consumoMedidoSaliente: new Decimal(
        raw.consumoMedidoSaliente?.toString() || '0',
      ),
      consumoFacturableSaliente: new Decimal(
        raw.consumoFacturableSaliente?.toString() || '0',
      ),
      consumoMedidoEntrante: new Decimal(
        raw.consumoMedidoEntrante?.toString() || '0',
      ),
      consumoFacturableEntrante: new Decimal(
        raw.consumoFacturableEntrante?.toString() || '0',
      ),
      consumoDiferidoEntrante: new Decimal(
        raw.consumoDiferidoEntrante?.toString() || '0',
      ),
      ventanaPromedio: raw.ventanaPromedio ?? null,
      promedioCalculado: raw.promedioCalculado
        ? new Decimal(raw.promedioCalculado.toString())
        : null,
      porcentajeCobro: raw.porcentajeCobro
        ? new Decimal(raw.porcentajeCobro.toString())
        : null,
      tarifaOrigenSnapshot:
        (raw.tarifaOrigenSnapshot as Record<string, unknown>) ?? null,
      prefacturaDetalleSalienteId: raw.prefacturaDetalleSalienteId ?? null,
      prefacturaDetalleEntranteId: raw.prefacturaDetalleEntranteId ?? null,
      estado: raw.estado,
      solicitadoPorUsuarioId: raw.solicitadoPorUsuarioId ?? null,
      autorizadoPorUsuarioId: raw.autorizadoPorUsuarioId ?? null,
      autorizadoEn: raw.autorizadoEn ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
      creadoPor: raw.creadoPor ?? null,
      actualizadoPor: raw.actualizadoPor ?? null,
    });
  }
}
