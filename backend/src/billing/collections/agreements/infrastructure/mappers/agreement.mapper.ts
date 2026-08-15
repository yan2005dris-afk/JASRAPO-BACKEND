import { AgreementEntity } from '../../domain/entities/agreement.entity';
import { InstallmentEntity } from '../../domain/entities/installment.entity';
import { Decimal } from 'decimal.js';

function toNumber(val: any): number {
  if (val === null || val === undefined) return 0;
  if (val instanceof Decimal) return val.toNumber();
  return Number(val);
}

export class AgreementMapper {
  static toDomainInstallment(raw: any): InstallmentEntity {
    return new InstallmentEntity({
      cuotaConvenioId: BigInt(raw.cuotaConvenioId),
      convenioId: BigInt(raw.convenioId),
      numeroCuota: raw.numeroCuota,
      valorCuota: toNumber(raw.valorCuota),
      fechaVencimiento: raw.fechaVencimiento,
      estado: raw.estado,
      fechaPago: raw.fechaPago ?? null,
      montoPagado: toNumber(raw.montoPagado),
      saldoPendiente: toNumber(raw.saldoPendiente),
      diasRetraso: raw.diasRetraso ?? 0,
      interesMoraAplicado: toNumber(raw.interesMoraAplicado),
      pagoCompleto: Boolean(raw.pagoCompleto),
      fechaPagoAnticipado: raw.fechaPagoAnticipado ?? null,
    });
  }

  static toDomainInstallmentList(rawList: any[]): InstallmentEntity[] {
    return rawList.map(AgreementMapper.toDomainInstallment);
  }

  static toDomain(raw: any): AgreementEntity | null {
    if (!raw) return null;

    return new AgreementEntity({
      convenioId: BigInt(raw.convenioId),
      contratoId: BigInt(raw.contratoId),
      numeroCuotas: raw.numeroCuotas,
      abonoInicial: toNumber(raw.abonoInicial),
      deudaTotal: toNumber(raw.deudaTotal),
      mesesMoraActual: raw.mesesMoraActual ?? 0,
      estado: raw.estado,
      fechaAprobacion: raw.fechaAprobacion ?? null,
      fechaPrimerPago: raw.fechaPrimerPago,
      fechaProximoPago: raw.fechaProximoPago ?? null,
      montoPagadoActual: toNumber(raw.montoPagadoActual),
      motivo: raw.motivo ?? null,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
      cuotas: Array.isArray(raw.cuotaConvenio)
        ? raw.cuotaConvenio.map(AgreementMapper.toDomainInstallment)
        : undefined,
    });
  }

  static toDomainList(rawList: any[]): AgreementEntity[] {
    return rawList
      .map(AgreementMapper.toDomain)
      .filter((e): e is AgreementEntity => e !== null);
  }
}
