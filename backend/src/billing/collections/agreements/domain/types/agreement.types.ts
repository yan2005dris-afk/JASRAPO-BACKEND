/**
 * Re-exports canonicos de `AgreementRow` y `CuotaConvenioRow` para los
 * consumidores de dominio.
 *
 * Los tipos se declaran en `infrastructure/repositories/agreement.include.ts`
 * (donde vive `agreementInclude`, el detalle Prisma), pero el dominio
 * consume estos tipos desde aca. Esto preserva la inversion de
 * dependencias: el dominio no importa nada de `infrastructure/` directo.
 *
 * Si en el futuro se cambia el ORM, este es el unico archivo del BC
 * a migrar las firmas de los re-exports.
 */
export type {
  AgreementRow,
  CuotaConvenioRow,
} from '../../infrastructure/repositories/agreement.include';

export interface AgreementFilters {
  contratoId?: string | bigint;
  estado?: string;
  search?: string;
}

export interface CreateInstallmentData {
  numeroCuota: number;
  valorCuota: number;
  saldoPendiente: number;
  fechaVencimiento: Date;
  estado: string;
  montoPagado: number;
  diasRetraso: number;
  interesMoraAplicado: number;
  pagoCompleto: boolean;
}

export interface CreateAgreementData {
  contratoId: bigint;
  numeroCuotas: number;
  abonoInicial: number;
  deudaTotal: number;
  mesesMoraActual: number;
  estado: string;
  fechaPrimerPago: Date;
  fechaProximoPago: Date;
  montoPagadoActual: number;
  motivo?: string | null;
}

export interface PrefacturaDeudaRaw {
  prefacturaId: bigint;
  periodoId: number;
  totalPagar: number;
  abono: number;
  estado: string;
  createdAt: Date;
}

/**
 * Read-model puro para el reporte PDF de convenio.
 * No es una entity, es un DTO de salida sin comportamiento.
 */
export interface PaymentAgreementReportReadModel {
  convenio: {
    convenioId: string;
    contratoId: string;
    deudaTotal: number;
    abonoInicial: number;
    numeroCuotas: number;
    fechaPrimerPago: string;
    periodoInicio: string;
    motivo: string | null;
    createdAt: string;
    cuotaMensual: number;
    primeraCuota: number;
    contrato: {
      numeroGuia: string;
      direccionSuministro: string;
    };
    cliente: {
      nombres: string;
      apellidos: string;
      razonSocial: string | null;
      identificacion: string;
      email: string | null;
    };
  };
}
