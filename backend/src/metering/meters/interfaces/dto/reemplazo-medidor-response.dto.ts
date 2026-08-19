import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MotivoReemplazoMedidor,
  ResponsabilidadDano,
  TratamientoSaliente,
  TratamientoEntrante,
  EstadoResolucionConsumo,
} from 'src/shared/enums';

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
}
