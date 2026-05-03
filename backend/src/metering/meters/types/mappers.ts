import type { Decimal } from '@prisma/client/runtime/wasm-compiler-edge';
import { MeterResponseDto } from '../dto/meter-response.dto';
import { DateUtil } from 'src/infrastructure/common/util/date.util';

/**
 * Tipo de entrada desde Prisma (antes de conversión de Decimal)
 */
export type MeterPrismaRaw = {
  medidorId: bigint;
  contratoId: bigint | null;
  marca: string;
  modelo: string;
  serie: string;
  estado: string;
  fechaInstalacion: Date | null;
  fechaBaja: Date | null;
  motivo: string | null;
  latitud: Decimal | null;
  longitud: Decimal | null;
};

/**
 * Mapea resultado de Prisma a DTO de response
 * Convierte Decimal a number y fechas a formato frontend (YYYY-MM-DD)
 */
export function toMeterResponse(meter: MeterPrismaRaw): MeterResponseDto {
  return {
    medidorId: meter.medidorId,
    contratoId: meter.contratoId,
    marca: meter.marca,
    modelo: meter.modelo,
    serie: meter.serie,
    estado: meter.estado as any,
    fechaInstalacion: DateUtil.formatForFrontend(meter.fechaInstalacion),
    fechaBaja: DateUtil.formatForFrontend(meter.fechaBaja),
    motivo: meter.motivo,
    latitud: meter.latitud ? Number(meter.latitud) : null,
    longitud: meter.longitud ? Number(meter.longitud) : null,
  };
}