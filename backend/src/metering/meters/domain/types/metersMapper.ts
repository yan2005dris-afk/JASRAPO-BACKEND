import type { MeterResponseDto } from '../../interfaces/dto/meter-response.dto';
import { DateUtil } from 'src/shared/utils/date.util';

/**
 * Mapea resultado de Prisma a DTO de response
 * Convierte Decimal a number y fechas a formato frontend (YYYY-MM-DD)
 */
export function toMeterResponse(meter: any): MeterResponseDto {
  return {
    medidorId: meter.medidorId,
    marca: meter.marca,
    modelo: meter.modelo,
    serie: meter.serie,
    estado: meter.estado,
    fechaInstalacion: DateUtil.formatForFrontend(meter.fechaInstalacion),
    fechaBaja: DateUtil.formatForFrontend(meter.fechaBaja),
    motivo: meter.motivo,
    latitud: meter.latitud ? Number(meter.latitud) : null,
    longitud: meter.longitud ? Number(meter.longitud) : null,
  };
}
