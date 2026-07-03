import type { Prisma } from 'src/generated/prisma/client';

export abstract class PaymentRepository {
  abstract findUniquePago(
    where: Prisma.PagosWhereUniqueInput,
    select?: Prisma.PagosSelect,
  ): Promise<any>;

  abstract findManyPagos(params: {
    select?: Prisma.PagosSelect;
    where?: Prisma.PagosWhereInput;
    orderBy?: Prisma.PagosOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]>;

  abstract createPago(
    data: Prisma.PagosCreateInput | Prisma.PagosUncheckedCreateInput,
    select?: Prisma.PagosSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract updatePago(
    where: Prisma.PagosWhereUniqueInput,
    data: Prisma.PagosUpdateInput | Prisma.PagosUncheckedUpdateInput,
    select?: Prisma.PagosSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract findManyDetallePago(
    params: {
      select?: Prisma.DetallePagoSelect;
      where?: Prisma.DetallePagoWhereInput;
      orderBy?: Prisma.DetallePagoOrderByWithRelationInput;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<any[]>;

  abstract createManyDetallePago(
    data: Prisma.DetallePagoCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract createDetallePago(
    data: Prisma.DetallePagoCreateInput | Prisma.DetallePagoUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract updateManyDetallePago(
    where: Prisma.DetallePagoWhereInput,
    data: Prisma.DetallePagoUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract findManySaldoFavor(params: {
    select?: Prisma.SaldoFavorClienteSelect;
    where?: Prisma.SaldoFavorClienteWhereInput;
    orderBy?: Prisma.SaldoFavorClienteOrderByWithRelationInput;
  }): Promise<any[]>;

  abstract findUniqueSaldoFavor(
    where: Prisma.SaldoFavorClienteWhereUniqueInput,
    select?: Prisma.SaldoFavorClienteSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract createSaldoFavor(
    data:
      | Prisma.SaldoFavorClienteCreateInput
      | Prisma.SaldoFavorClienteUncheckedCreateInput,
    select?: Prisma.SaldoFavorClienteSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract updateSaldoFavor(
    where: Prisma.SaldoFavorClienteWhereUniqueInput,
    data:
      | Prisma.SaldoFavorClienteUpdateInput
      | Prisma.SaldoFavorClienteUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract updateManySaldoFavor(
    where: Prisma.SaldoFavorClienteWhereInput,
    data: Prisma.SaldoFavorClienteUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract findFirstCajaSesion(
    where: Prisma.CajaSesionWhereInput,
    select?: Prisma.CajaSesionSelect,
  ): Promise<any>;

  abstract findUniqueCliente(
    where: Prisma.ClientesWhereUniqueInput,
    select?: Prisma.ClientesSelect,
  ): Promise<any>;

  abstract findUniqueComprobante(
    where: Prisma.ComprobantesWhereUniqueInput,
    select?: Prisma.ComprobantesSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract findUniqueCuotaConvenio(
    where: Prisma.CuotaConvenioWhereUniqueInput,
    select?: Prisma.CuotaConvenioSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract updateCuotaConvenio(
    where: Prisma.CuotaConvenioWhereUniqueInput,
    data: Prisma.CuotaConvenioUpdateInput | Prisma.CuotaConvenioUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any>;

  abstract executeTransaction<T>(callback: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
}
