import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

  private client(tx?: Prisma.TransactionClient) {
    return tx ?? this.prisma;
  }

  async findUniquePago(
    where: Prisma.PagosWhereUniqueInput,
    select?: Prisma.PagosSelect,
  ): Promise<any> {
    return this.prisma.pagos.findUnique({ where, select });
  }

  async findManyPagos(params: {
    select?: Prisma.PagosSelect;
    where?: Prisma.PagosWhereInput;
    orderBy?: Prisma.PagosOrderByWithRelationInput;
    take?: number;
    skip?: number;
  }): Promise<any[]> {
    return this.prisma.pagos.findMany(params);
  }

  async createPago(
    data: Prisma.PagosCreateInput | Prisma.PagosUncheckedCreateInput,
    select?: Prisma.PagosSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).pagos.create({ data, select });
  }

  async updatePago(
    where: Prisma.PagosWhereUniqueInput,
    data: Prisma.PagosUpdateInput | Prisma.PagosUncheckedUpdateInput,
    select?: Prisma.PagosSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).pagos.update({ where, data, select });
  }

  async updateManyPagos(
    where: Prisma.PagosWhereInput,
    data: Prisma.PagosUpdateInput | Prisma.PagosUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<{ count: number }> {
    return this.client(tx).pagos.updateMany({ where, data });
  }

  async findManyDetallePago(
    params: {
      select?: Prisma.DetallePagoSelect;
      where?: Prisma.DetallePagoWhereInput;
      orderBy?: Prisma.DetallePagoOrderByWithRelationInput;
    },
    tx?: Prisma.TransactionClient,
  ): Promise<any[]> {
    return this.client(tx).detallePago.findMany(params);
  }

  async createManyDetallePago(
    data: Prisma.DetallePagoCreateManyInput[],
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).detallePago.createMany({ data });
  }

  async createDetallePago(
    data:
      | Prisma.DetallePagoCreateInput
      | Prisma.DetallePagoUncheckedCreateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).detallePago.create({ data });
  }

  async updateManyDetallePago(
    where: Prisma.DetallePagoWhereInput,
    data: Prisma.DetallePagoUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).detallePago.updateMany({ where, data });
  }

  async findManySaldoFavor(params: {
    select?: Prisma.SaldoFavorClienteSelect;
    where?: Prisma.SaldoFavorClienteWhereInput;
    orderBy?: Prisma.SaldoFavorClienteOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.saldoFavorCliente.findMany(params);
  }

  async findUniqueSaldoFavor(
    where: Prisma.SaldoFavorClienteWhereUniqueInput,
    select?: Prisma.SaldoFavorClienteSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).saldoFavorCliente.findUnique({ where, select });
  }

  async createSaldoFavor(
    data:
      | Prisma.SaldoFavorClienteCreateInput
      | Prisma.SaldoFavorClienteUncheckedCreateInput,
    select?: Prisma.SaldoFavorClienteSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).saldoFavorCliente.create({ data, select });
  }

  async updateSaldoFavor(
    where: Prisma.SaldoFavorClienteWhereUniqueInput,
    data:
      | Prisma.SaldoFavorClienteUpdateInput
      | Prisma.SaldoFavorClienteUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).saldoFavorCliente.update({ where, data });
  }

  async updateManySaldoFavor(
    where: Prisma.SaldoFavorClienteWhereInput,
    data: Prisma.SaldoFavorClienteUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).saldoFavorCliente.updateMany({ where, data });
  }

  async findFirstCajaSesion(
    where: Prisma.CajaSesionWhereInput,
    select?: Prisma.CajaSesionSelect,
  ): Promise<any> {
    return this.prisma.cajaSesion.findFirst({ where, select });
  }

  async findUniqueCliente(
    where: Prisma.ClientesWhereUniqueInput,
    select?: Prisma.ClientesSelect,
  ): Promise<any> {
    return this.prisma.clientes.findUnique({ where, select });
  }

  async findUniqueComprobante(
    where: Prisma.ComprobantesWhereUniqueInput,
    select?: Prisma.ComprobantesSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).comprobantes.findUnique({ where, select });
  }

  async findUniqueCuotaConvenio(
    where: Prisma.CuotaConvenioWhereUniqueInput,
    select?: Prisma.CuotaConvenioSelect,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).cuotaConvenio.findUnique({ where, select });
  }

  async updateCuotaConvenio(
    where: Prisma.CuotaConvenioWhereUniqueInput,
    data:
      | Prisma.CuotaConvenioUpdateInput
      | Prisma.CuotaConvenioUncheckedUpdateInput,
    tx?: Prisma.TransactionClient,
  ): Promise<any> {
    return this.client(tx).cuotaConvenio.update({ where, data });
  }

  async lockComprobante(
    id: bigint,
    tx: Prisma.TransactionClient,
  ): Promise<void> {
    await tx.$queryRawUnsafe(
      'SELECT id FROM billing.comprobantes WHERE id = $1 FOR UPDATE',
      id,
    );
  }

  async executeTransaction<T>(
    callback: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
