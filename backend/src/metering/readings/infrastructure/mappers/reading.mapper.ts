import { LecturaEntity } from '../../domain/entities/lectura.entity';

export class ReadingMapper {
  static toDomain(raw: any): LecturaEntity | null {
    if (!raw) return null;

    const activeContrato = raw.medidor?.historial?.[0]?.contrato;

    return new LecturaEntity({
      lecturaId: raw.lecturaId,
      fecha: raw.fecha,
      lecturaAnterior: Number(raw.lecturaAnterior),
      lecturaActual: Number(raw.lecturaActual),
      consumoCalculado: Number(raw.consumoCalculado),
      medidorId: raw.medidorId,
      descripcionAnomalia: raw.descripcionAnomalia,
      fechaValidacion: raw.fechaValidacion,
      fotoUrl: raw.fotoUrl,
      estado: raw.estado,
      isValidada: raw.estado !== 'PENDIENTE',
      lecturaInicial: raw.lecturaInicial,
      periodoId: raw.periodoId,
      tieneAnomalia: !!raw.descripcionAnomalia,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      deletedAt: raw.deletedAt ?? null,
      contrato: activeContrato
        ? {
            contratoId: activeContrato.contratoId,
            numeroGuia: activeContrato.numeroGuia,
            direccionSuministro: activeContrato.direccionSuministro,
            estado: activeContrato.estado,
          }
        : null,
      medidor: raw.medidor
        ? {
            medidorId: raw.medidor.medidorId,
            serie: raw.medidor.serie,
            marca: raw.medidor.marca,
            modelo: raw.medidor.modelo,
          }
        : null,
      periodoRel: raw.periodoRel
        ? {
            periodoId: raw.periodoRel.periodoId,
            nombre: raw.periodoRel.nombre,
            fechaInicio: raw.periodoRel.fechaInicio,
            fechaFin: raw.periodoRel.fechaFin,
          }
        : null,
    });
  }

  static toDomainList(rawList: any[]): LecturaEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((item): item is LecturaEntity => item !== null);
  }
}
