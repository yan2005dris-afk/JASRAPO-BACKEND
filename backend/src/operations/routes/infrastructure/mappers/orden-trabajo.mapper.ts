import { OrdenTrabajoEntity } from '../../domain/entities/orden-trabajo.entity';
import { DateUtil } from 'src/shared/utils/date.util';

function formatDateField(
  value: Date | string | null | undefined,
): string | null {
  if (!value) return null;
  if (typeof value === 'string') return value;
  return DateUtil.formatForFrontend(value);
}

export class OrdenTrabajoMapper {
  static toEntity(raw: {
    ordenTrabajoId: bigint;
    rutaId: bigint;
    contratoId: bigint;
    medidorId?: bigint | null;
    tipoActividad: string;
    estado: string;
    ordenVisita: number;
    resultadoObservacion?: string | null;
    evidenciaFotoUrl?: string | null;
    completadoEn?: Date | string | null;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date | null;
    lecturaId?: bigint | null;

    contratoNumeroContrato?: string | null;
    contratoClienteNombre?: string | null;
    contratoDireccion?: string | null;
    medidorNumeroSerie?: string | null;
    lecturaLecturaId?: bigint | null;
  }): OrdenTrabajoEntity {
    return new OrdenTrabajoEntity({
      ordenTrabajoId: raw.ordenTrabajoId,
      rutaId: raw.rutaId,
      contratoId: raw.contratoId,
      medidorId: raw.medidorId ?? null,
      tipoActividad: raw.tipoActividad,
      estado: raw.estado,
      ordenVisita: raw.ordenVisita,
      resultadoObservacion: raw.resultadoObservacion ?? null,
      evidenciaFotoUrl: raw.evidenciaFotoUrl ?? null,
      completadoEn: raw.completadoEn ?? null,
      createdAt: raw.createdAt ?? new Date(),
      updatedAt: raw.updatedAt ?? new Date(),
      deletedAt: raw.deletedAt ?? null,
      lecturaId: raw.lecturaId ?? null,

      contratoNumeroContrato: raw.contratoNumeroContrato ?? null,
      contratoClienteNombre: raw.contratoClienteNombre ?? null,
      contratoDireccion: raw.contratoDireccion ?? null,
      medidorNumeroSerie: raw.medidorNumeroSerie ?? null,
      lecturaLecturaId: raw.lecturaLecturaId ?? null,
    });
  }

  static toEntityList(
    raws: Array<{
      ordenTrabajoId: bigint;
      rutaId: bigint;
      contratoId: bigint;
      medidorId?: bigint | null;
      tipoActividad: string;
      estado: string;
      ordenVisita: number;
      resultadoObservacion?: string | null;
      evidenciaFotoUrl?: string | null;
      completadoEn?: Date | string | null;
      createdAt?: Date;
      updatedAt?: Date;
      deletedAt?: Date | null;
      lecturaId?: bigint | null;

      contratoNumeroContrato?: string | null;
      contratoClienteNombre?: string | null;
      contratoDireccion?: string | null;
      medidorNumeroSerie?: string | null;
      lecturaLecturaId?: bigint | null;
    }>,
  ): OrdenTrabajoEntity[] {
    return raws.map((r) => OrdenTrabajoMapper.toEntity(r));
  }
}
