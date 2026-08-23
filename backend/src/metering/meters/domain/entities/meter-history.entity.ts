import type { Decimal } from 'decimal.js';

export class MeterHistoryEntity {
  historialId: bigint;
  medidorId: bigint;
  serie: string;
  marca: string;
  modelo: string;
  contratoId: bigint;
  clienteNombre: string | null;
  fechaDesde: Date;
  fechaHasta: Date | null;
  lecturaInicial: Decimal;
  lecturaFinal: Decimal | null;
  motivo: string | null;
  observacion: string | null;
  saldoPendienteCambio: Decimal | null;
  reemplazoSalienteId: bigint | null;
  reemplazoEntranteId: bigint | null;

  constructor(partial: Partial<MeterHistoryEntity>) {
    Object.assign(this, partial);
  }
}
