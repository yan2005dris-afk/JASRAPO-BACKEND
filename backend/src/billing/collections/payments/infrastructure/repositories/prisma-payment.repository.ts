import { Injectable } from '@nestjs/common';
import { Prisma } from 'src/generated/prisma/client';
import { PrismaService } from 'src/infrastructure/database/prisma.service';
import { PaymentRepository } from '../../domain/repositories/payment.repository';

@Injectable()
export class PrismaPaymentRepository implements PaymentRepository {
  constructor(private readonly prisma: PrismaService) {}

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
  ): Promise<any> {
    return this.prisma.pagos.create({ data, select });
  }

  async updatePago(
    where: Prisma.PagosWhereUniqueInput,
    data: Prisma.PagosUpdateInput | Prisma.PagosUncheckedUpdateInput,
    select?: Prisma.PagosSelect,
  ): Promise<any> {
    return this.prisma.pagos.update({ where, data, select });
  }

  async findManyDetallePago(params: {
    select?: Prisma.DetallePagoSelect;
    where?: Prisma.DetallePagoWhereInput;
    orderBy?: Prisma.DetallePagoOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.detallePago.findMany(params);
  }

  async createManyDetallePago(
    data: Prisma.DetallePagoCreateManyInput[],
  ): Promise<any> {
    return this.prisma.detallePago.createMany({ data });
  }

  async findManySaldoFavor(params: {
    select?: Prisma.SaldoFavorClienteSelect;
    where?: Prisma.SaldoFavorClienteWhereInput;
    orderBy?: Prisma.SaldoFavorClienteOrderByWithRelationInput;
  }): Promise<any[]> {
    return this.prisma.saldoFavorCliente.findMany(params);
  }

  async createSaldoFavor(
    data:
      | Prisma.SaldoFavorClienteCreateInput
      | Prisma.SaldoFavorClienteUncheckedCreateInput,
    select?: Prisma.SaldoFavorClienteSelect,
  ): Promise<any> {
    return this.prisma.saldoFavorCliente.create({ data, select });
  }

  async updateSaldoFavor(
    where: Prisma.SaldoFavorClienteWhereUniqueInput,
    data:
      | Prisma.SaldoFavorClienteUpdateInput
      | Prisma.SaldoFavorClienteUncheckedUpdateInput,
  ): Promise<any> {
    return this.prisma.saldoFavorCliente.update({ where, data });
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
  ): Promise<any> {
    return this.prisma.comprobantes.findUnique({ where, select });
  }

  async findUniqueCuotaConvenio(
    where: Prisma.CuotaConvenioWhereUniqueInput,
    select?: Prisma.CuotaConvenioSelect,
  ): Promise<any> {
    return this.prisma.cuotaConvenio.findUnique({ where, select });
  }

  async updateCuotaConvenio(
    where: Prisma.CuotaConvenioWhereUniqueInput,
    data: Prisma.CuotaConvenioUpdateInput | Prisma.CuotaConvenioUncheckedUpdateInput,
  ): Promise<any> {
    return this.prisma.cuotaConvenio.update({ where, data });
  }

  async executeTransaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(callback);
  }
}
