import type { PaymentEntity } from '../entities/payment.entity';
import type { PaymentDetailEntity } from '../entities/payment-detail.entity';
import type { SaldoFavorEntity } from '../entities/saldo-favor.entity';
import type { PaymentFilters } from '../types/payment.types';
import type { PaginateOptions } from 'src/infrastructure/common/utils/pagination.util';
import type { PaginatedResult } from 'src/shared/domain/types/pagination.types';

export interface ComprobanteInfo {
  id: bigint;
  importeTotal: number | null;
}

export interface CuotaConvenioPaymentInfo {
  cuotaConvenioId: bigint;
  convenioId: bigint;
  estado: string;
  saldoPendiente: number;
  montoPagado: number;
  deletedAt: Date | null;
}

export interface CreatePagoRecordData {
  clienteId: bigint;
  cajaId: bigint | null;
  banco: string | null;
  tarjetaCredito: string | null;
  fechaPago: Date;
  montoTotalRecibido: number;
  numeroOperacion: string | null;
  observaciones: string | null;
  referenciaBanco: string | null;
  comprobanteUrl: string | null;
  estadoPago: string;
  creadoPor: string;
}

export interface CreateDetallePagoData {
  pagoId: bigint;
  comprobanteId: bigint | null;
  cuotaConvenioId: bigint | null;
  tipoPago: string;
  montoAbonado: number;
  formaPagoId: number;
  referencia: string | null;
  fechaTransaccion: Date | null;
}

export interface CreateSaldoFavorData {
  clienteId: bigint;
  pagoId: bigint;
  montoSaldo: number;
  tipoOrigen: string;
  disponibleParaAplicar: boolean;
}

export abstract class PaymentRepository {
  abstract findById(id: bigint, tx?: unknown): Promise<PaymentEntity | null>;

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
    tx?: unknown,
  ): Promise<ComprobanteInfo | null>;

  abstract lockComprobante(comprobanteId: bigint, tx: unknown): Promise<void>;

  abstract findComprobanteAppliedSum(
    comprobanteId: bigint,
    tx?: unknown,
  ): Promise<number>;

  abstract findCuotaConvenioById(
    cuotaId: bigint,
    tx?: unknown,
  ): Promise<CuotaConvenioPaymentInfo | null>;

  abstract findSaldoFavorById(
    saldoFavorId: bigint,
    tx?: unknown,
  ): Promise<SaldoFavorEntity | null>;

  abstract createPagoRecord(
    data: CreatePagoRecordData,
    tx: unknown,
  ): Promise<{ pagoId: bigint }>;

  abstract createDetallesPago(
    detalles: CreateDetallePagoData[],
    tx: unknown,
  ): Promise<void>;

  abstract createSaldoFavorRecord(
    data: CreateSaldoFavorData,
    tx: unknown,
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
    tx: unknown,
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
    tx: unknown,
  ): Promise<void>;

  abstract updateSaldoFavorRecord(
    saldoFavorId: bigint,
    data: {
      disponibleParaAplicar?: boolean;
      montoSaldo?: number;
      deletedAt?: Date;
    },
    tx: unknown,
  ): Promise<void>;

  abstract updateManySaldoFavorByPagoId(
    pagoId: bigint,
    data: { disponibleParaAplicar: boolean; deletedAt: Date },
    tx: unknown,
  ): Promise<void>;

  abstract updateManyDetallePagoByPagoId(
    pagoId: bigint,
    data: { deletedAt: Date },
    tx: unknown,
  ): Promise<void>;

  abstract updatePagoState(
    pagoId: bigint,
    estadoPago: string,
    observaciones?: string,
    tx?: unknown,
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
    tx: unknown,
  ): Promise<{ count: number }>;

  abstract executeTransaction<T>(
    callback: (tx: unknown) => Promise<T>,
  ): Promise<T>;
}
