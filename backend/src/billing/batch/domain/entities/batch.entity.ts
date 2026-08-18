import type { BatchCommunityRef, BatchPeriodoRef } from '../types/batch.types';
import type { PreInvoiceEntity } from '../../../pre-invoice/domain/entities/pre-invoice.entity';

export class BatchEntity {
  loteId: bigint;
  comunidadId: number;
  periodoId: number;
  estado: string;
  totalMonto: number;
  notas: string | null;
  creadoPor: string | null;
  totalEmisiones: number;
  mes: number;
  rutaId?: bigint | null;
  ruta?: { rutaId: bigint; nombre?: string | null } | null;
  createdAt: Date;
  updatedAt: Date;

  comunidad?: BatchCommunityRef | null;
  periodoRel?: BatchPeriodoRef | null;
  prefacturas?: PreInvoiceEntity[];

  constructor(partial: Partial<BatchEntity>) {
    Object.assign(this, partial);
  }
}
