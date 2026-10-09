import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { MeterEntity } from '../../domain/entities/meter.entity';
import { DateUtil } from 'src/shared/utils/date.util';

export class MeterResponseDto {
  @ApiProperty({
    description: 'ID único del medidor',
    example: '1',
  })
  medidorId: string;

  @ApiPropertyOptional({
    description:
      'Código institucional legado, puede ser nulo para medidores nuevos',
    example: 'MED-000123',
  })
  codigo: string | null;

  @ApiProperty({
    description: 'Marca del medidor',
    example: 'Itron',
  })
  marca: string;

  @ApiProperty({
    description: 'Modelo del medidor',
    example: 'CX1000',
  })
  modelo: string;

  @ApiProperty({
    description: 'Número de serie único del medidor',
    example: 'SN-2024-001234',
  })
  serie: string;

  @ApiProperty({
    description: 'Estado actual del medidor',
    example: 'BODEGA',
  })
  estado: string;

  @ApiPropertyOptional({
    description: 'Fecha de instalación del medidor (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  fechaInstalacion: string | null;

  @ApiPropertyOptional({
    description: 'Fecha de baja del medidor (YYYY-MM-DD)',
    example: null,
  })
  fechaBaja: string | null;

  @ApiPropertyOptional({
    description: 'Motivo de la baja',
    example: 'Obsoleto',
  })
  motivo: string | null;

  @ApiPropertyOptional({
    description: 'ID de contrato activo',
    example: '123',
  })
  contratoId: string | null;

  @ApiPropertyOptional({
    description: 'Nombre completo del cliente',
    example: 'Juan Pérez',
  })
  clienteNombre: string | null;

  @ApiPropertyOptional({
    description: 'Dirección del suministro (útil para operar offline sin mapa)',
    example: 'Av. Principal 123',
  })
  direccionSuministro: string | null;

  constructor(partial: Partial<MeterResponseDto>) {
    Object.assign(this, partial);
  }

  static fromRow(meter: MeterEntity): MeterResponseDto {
    return new MeterResponseDto({
      medidorId: String(meter.medidorId),
      codigo: meter.codigo ?? null,
      marca: meter.marca,
      modelo: meter.modelo,
      serie: meter.serie,
      estado: meter.estado,
      fechaInstalacion: DateUtil.formatForFrontend(meter.fechaInstalacion),
      fechaBaja: DateUtil.formatForFrontend(meter.fechaBaja),
      motivo: meter.motivo,
      contratoId: meter.contratoId?.toString() ?? null,
      clienteNombre: meter.clienteNombre ?? null,
      direccionSuministro: meter.direccionSuministro ?? null,
    });
  }
}

/**
 * Ejemplo de respuesta para Swagger
 */
export const MeterResponseExample = {
  medidorId: '1',
  codigo: 'MED-000123',
  marca: 'Itron',
  modelo: 'CX1000',
  serie: 'SN-2024-001234',
  estado: 'BODEGA',
  fechaInstalacion: '2024-01-15',
  fechaBaja: null,
  motivo: null,
};
