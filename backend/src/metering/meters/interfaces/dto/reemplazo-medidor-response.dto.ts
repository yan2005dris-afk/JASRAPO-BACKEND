import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
  EstadoResolucionConsumo,
} from 'src/shared/enums';
import type { ReemplazoMedidorEntity } from '../../domain/entities/reemplazo-medidor.entity';

export class ReemplazoMedidorResponseDto {
  @ApiProperty({ example: '1' })
  reemplazoId: string;

  @ApiProperty({ example: '1' })
  contratoId: string;

  @ApiProperty({ example: '10' })
  historialSalienteId: string;

  @ApiProperty({ example: '11' })
  historialEntranteId: string;

  @ApiPropertyOptional({ example: '100' })
  lecturaFinalSalienteId?: string | null;

  @ApiPropertyOptional({ example: '101' })
  lecturaInicialEntranteId?: string | null;

  @ApiPropertyOptional({ example: '5' })
  ordenTrabajoId?: string | null;

  @ApiProperty({ example: 1 })
  periodoOrigenId: number;

  @ApiPropertyOptional({ example: 2 })
  periodoDestinoId?: number | null;

  @ApiProperty({ example: 8 })
  mesOrigen: number;

  @ApiPropertyOptional({ example: 9 })
  mesDestino?: number | null;

  @ApiProperty({ enum: MotivoReemplazoMedidor })
  motivo: MotivoReemplazoMedidor;

  @ApiProperty({ enum: ResponsabilidadDano })
  responsabilidadDano: ResponsabilidadDano;

  @ApiPropertyOptional({ example: 'Pantalla rota' })
  detalleMotivo?: string | null;

  @ApiProperty({ enum: TratamientoSaliente })
  tratamientoSaliente: TratamientoSaliente;

  @ApiProperty({ enum: TratamientoEntrante })
  tratamientoEntrante: TratamientoEntrante;

  @ApiProperty({ example: 30 })
  consumoMedidoSaliente: number;

  @ApiProperty({ example: 30 })
  consumoFacturableSaliente: number;

  @ApiProperty({ example: 0 })
  consumoMedidoEntrante: number;

  @ApiProperty({ example: 0 })
  consumoFacturableEntrante: number;

  @ApiProperty({ example: 0 })
  consumoDiferidoEntrante: number;

  @ApiPropertyOptional({ example: 3 })
  ventanaPromedio?: number | null;

  @ApiPropertyOptional({ example: 25.5 })
  promedioCalculado?: number | null;

  @ApiPropertyOptional({ example: 100 })
  porcentajeCobro?: number | null;

  @ApiProperty({ enum: EstadoResolucionConsumo })
  estado: EstadoResolucionConsumo;

  @ApiPropertyOptional()
  solicitadoPorUsuarioId?: string | null;

  @ApiPropertyOptional()
  autorizadoPorUsuarioId?: string | null;

  @ApiPropertyOptional()
  autorizadoEn?: Date | null;

  @ApiProperty()
  createdAt: Date;

  constructor(partial: Partial<ReemplazoMedidorResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(r: ReemplazoMedidorEntity): ReemplazoMedidorResponseDto {
    return new ReemplazoMedidorResponseDto({
      reemplazoId: r.reemplazoId.toString(),
      contratoId: r.contratoId.toString(),
      historialSalienteId: r.historialSalienteId.toString(),
      historialEntranteId: r.historialEntranteId.toString(),
      lecturaFinalSalienteId: r.lecturaFinalSalienteId
        ? r.lecturaFinalSalienteId.toString()
        : null,
      lecturaInicialEntranteId: r.lecturaInicialEntranteId
        ? r.lecturaInicialEntranteId.toString()
        : null,
      ordenTrabajoId: r.ordenTrabajoId ? r.ordenTrabajoId.toString() : null,
      periodoOrigenId: r.periodoOrigenId,
      periodoDestinoId: r.periodoDestinoId ?? null,
      mesOrigen: r.mesOrigen,
      mesDestino: r.mesDestino ?? null,
      motivo: r.motivo,
      responsabilidadDano: r.responsabilidadDano,
      detalleMotivo: r.detalleMotivo ?? null,
      tratamientoSaliente: r.tratamientoSaliente,
      tratamientoEntrante: r.tratamientoEntrante,
      consumoMedidoSaliente: Number(r.consumoMedidoSaliente),
      consumoFacturableSaliente: Number(r.consumoFacturableSaliente),
      consumoMedidoEntrante: Number(r.consumoMedidoEntrante),
      consumoFacturableEntrante: Number(r.consumoFacturableEntrante),
      consumoDiferidoEntrante: Number(r.consumoDiferidoEntrante),
      ventanaPromedio: r.ventanaPromedio ?? null,
      promedioCalculado: r.promedioCalculado
        ? Number(r.promedioCalculado)
        : null,
      porcentajeCobro: r.porcentajeCobro ? Number(r.porcentajeCobro) : null,
      estado: r.estado,
      solicitadoPorUsuarioId: r.solicitadoPorUsuarioId ?? null,
      autorizadoPorUsuarioId: r.autorizadoPorUsuarioId ?? null,
      autorizadoEn: r.autorizadoEn ?? null,
      createdAt: r.createdAt,
    });
  }
}
