export abstract class PreInvoiceRepository {
  abstract findMany(params: {
    where?: Record<string, any>;
    include?: Record<string, any>;
    orderBy?: Record<string, any>;
    skip?: number;
    take?: number;
  }): Promise<any[]>;

  /** Finds pre-invoice IDs for a given batch/lote */
  abstract findIdsByLoteId(loteId: bigint): Promise<{ prefacturaId: bigint }[]>;

  abstract count(where?: Record<string, any>): Promise<number>;

  abstract findById(
    id: number | bigint,
    options?: { include?: Record<string, any> },
  ): Promise<any>;

  abstract updateState(
    id: number | bigint,
    estado: string,
    estadoEsperado: string,
    data?: {
      aprobadaPor?: string;
      motivoRechazo?: string;
      fechaAprobacion?: Date;
      comprobanteId?: bigint;
    },
  ): Promise<boolean>;
}
