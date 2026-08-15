export class SaldoFavorEntity {
  saldoFavorId: bigint;
  clienteId: bigint;
  pagoId: bigint | null;
  montoSaldo: number;
  tipoOrigen: string;
  disponibleParaAplicar: boolean;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  constructor(partial: Partial<SaldoFavorEntity>) {
    Object.assign(this, partial);
  }
}
