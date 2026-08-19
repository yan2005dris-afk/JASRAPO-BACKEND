import type { PaymentDetailEntity } from './payment-detail.entity';
import type { SaldoFavorEntity } from './saldo-favor.entity';

export class PaymentEntity {
  pagoId: bigint;
  clienteId: bigint;
  cajaId: bigint | null;
  banco: string | null;
  tarjetaCredito: string | null;
  comprobanteUrl: string | null;
  fechaPago: Date;
  montoTotalRecibido: number;
  numeroOperacion: string | null;
  observaciones: string | null;
  referenciaBanco: string | null;
  estadoPago: string;
  creadoPor: string;
  anuladoPor: string | null;
  fechaAnulacion: Date | null;
  motivoAnulacion: string | null;
  createdAt: Date;
  updatedAt?: Date;
  deletedAt?: Date | null;

  detallePago?: PaymentDetailEntity[];
  saldosFavor?: SaldoFavorEntity[];
  cliente?: {
    clienteId: bigint;
    nombres: string;
    apellidos: string;
    razonSocial: string | null;
    identificacion: string;
    email: string | null;
    telefono: string | null;
    direccionDomicilio: string | null;
  };

  constructor(partial: Partial<PaymentEntity>) {
    Object.assign(this, partial);
  }
}
