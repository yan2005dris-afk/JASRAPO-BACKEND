import type { MeterResponseDto } from '../dto/meter-response.dto';
import { DateUtil } from 'src/infrastructure/common/util/date.util';

/**
 * Mapea resultado de Prisma a DTO de response
 * Convierte Decimal a number y fechas a formato frontend (YYYY-MM-DD)
 */
export function toMeterResponse(meter: any): MeterResponseDto {
  return {
    medidorId: meter.medidorId,
    contratoId: meter.contratoId,
    marca: meter.marca,
    modelo: meter.modelo,
    serie: meter.serie,
    estado: meter.estado?.codigo,
    fechaInstalacion: DateUtil.formatForFrontend(meter.fechaInstalacion),
    fechaBaja: DateUtil.formatForFrontend(meter.fechaBaja),
    motivo: meter.motivo,
    latitud: meter.latitud ? Number(meter.latitud) : null,
    longitud: meter.longitud ? Number(meter.longitud) : null,
  };
}