import type { PaymentEntity } from '../entities/payment.entity';
import type { PaymentDetailEntity } from '../entities/payment-detail.entity';
import type { SaldoFavorEntity } from '../entities/saldo-favor.entity';
import type {
  PaymentFilters,
  ComprobanteInfo,
  CuotaConvenioPaymentInfo,
  CreatePagoRecordData,
  CreateDetallePagoData,
  CreateSaldoFavorData,
} from '../types/payment.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';
import type { TransactionContext } from 'src/shared/domain/types/transaction';

export abstract class PaymentRepository {
  abstract findById(
    id: bigint,
    tx?: TransactionContext,
  ): Promise<PaymentEntity | null>;

  abstract paginate(
    pagination: PaginateOptions,
    filters?: PaymentFilters,
  ): Promise<PaginatedResult<PaymentEntity>>;

  abstract findSaldoFavorByCliente(
    clienteId: bigint,
  ): Promise<SaldoFavorEntity[]>;

  abstract findDailyCashPayments(params: {
    fechaInicio: Date;
    fechaFin: Date;
    cajaId?: bigint;
  }): Promise<PaymentEntity[]>;

  abstract findPaymentDetailsByPagoId(
    pagoId: bigint,
  ): Promise<PaymentDetailEntity[]>;

  abstract findPaymentDetailsByComprobanteId(
    comprobanteId: bigint,
  ): Promise<PaymentDetailEntity[]>;

  abstract clientExists(clienteId: bigint): Promise<boolean>;

  abstract isCajaOpen(cajaId: bigint): Promise<boolean>;

  abstract findComprobanteById(
    comprobanteId: bigint,
    tx?: TransactionContext,
  ): Promise<ComprobanteInfo | null>;

  abstract lockComprobante(
    comprobanteId: bigint,
    tx: TransactionContext,
  ): Promise<void>;

  abstract findComprobanteAppliedSum(
    comprobanteId: bigint,
    tx?: TransactionContext,
  ): Promise<number>;

  abstract findCuotaConvenioById(
    cuotaId: bigint,
    tx?: TransactionContext,
  ): Promise<CuotaConvenioPaymentInfo | null>;

  abstract findSaldoFavorById(
    saldoFavorId: bigint,
    tx?: unknown,
  ): Promise<SaldoFavorEntity | null>;

  abstract createPagoRecord(
    data: CreatePagoRecordData,
    tx: TransactionContext,
  ): Promise<{ pagoId: bigint }>;

  abstract createDetallesPago(
    detalles: CreateDetallePagoData[],
    tx: TransactionContext,
  ): Promise<void>;

  abstract createSaldoFavorRecord(
    data: CreateSaldoFavorData,
    tx: TransactionContext,
  ): Promise<void>;

  abstract updateCuotaConvenioPayment(
    cuotaConvenioId: bigint,
    saldoPendienteActual: number,
    data: {
      montoPagado: number;
      saldoPendiente: number;
      estado: string;
      pagoCompleto: boolean;
      fechaPago: Date | null;
    },
    tx: TransactionContext,
  ): Promise<{ count: number }>;

  abstract updateCuotaConvenioRevert(
    cuotaConvenioId: bigint,
    data: {
      montoPagado: number;
      saldoPendiente: number;
      estado: string;
      pagoCompleto: boolean;
      fechaPago?: Date | null;
    },
    tx: TransactionContext,
  ): Promise<void>;

  abstract updateSaldoFavorRecord(
    saldoFavorId: bigint,
    data: {
      disponibleParaAplicar?: boolean;
      montoSaldo?: number;
      deletedAt?: Date;
    },
    tx: TransactionContext,
  ): Promise<void>;

  abstract updateManySaldoFavorByPagoId(
    pagoId: bigint,
    data: { disponibleParaAplicar: boolean; deletedAt: Date },
    tx: TransactionContext,
  ): Promise<void>;

  abstract updateManyDetallePagoByPagoId(
    pagoId: bigint,
    data: { deletedAt: Date },
    tx: TransactionContext,
  ): Promise<void>;

  abstract updatePagoState(
    pagoId: bigint,
    estadoPago: string,
    observaciones?: string,
    tx?: TransactionContext,
  ): Promise<void>;

  abstract annulPagoTransaction(
    pagoId: bigint,
    currentEstado: string,
    data: {
      motivoAnulacion: string;
      anuladoPor: string;
      fechaAnulacion: Date;
      deletedAt: Date;
    },
    tx: TransactionContext,
  ): Promise<{ count: number }>;

  abstract settlePaidComprobante(
    comprobanteId: bigint,
    totalAbonado: number,
  ): Promise<void>;

  abstract executeTransaction<T>(
    callback: (tx: TransactionContext) => Promise<T>,
  ): Promise<T>;
}
