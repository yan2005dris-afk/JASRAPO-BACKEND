export const CONTRACT_WORK_ORDER_PORT = Symbol('CONTRACT_WORK_ORDER_PORT');

export interface EnsureContractWorkOrderTarget {
  contratoId: bigint;
  numeroGuia: string;
  comunidadId: number;
  sectorId: number | null;
}

export interface ContractWorkOrderPort {
  ensureWorkOrder(
    tx: unknown,
    contract: EnsureContractWorkOrderTarget,
    medidorId: bigint,
    activity: 'INSPECCION' | 'INSTALACION',
  ): Promise<{ ordenTrabajoId: bigint; rutaId: bigint; estado: string }>;
}
