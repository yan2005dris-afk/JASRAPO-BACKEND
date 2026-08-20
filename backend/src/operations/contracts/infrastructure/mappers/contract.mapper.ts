import { ContractEntity } from '../../domain/entities/contract.entity';
import type { ContractRecord } from '../repositories/prisma-contract.repository';

export class ContractMapper {
  static toDomain(raw: ContractRecord | null): ContractEntity | null {
    if (!raw) return null;

    return new ContractEntity({
      contratoId: raw.contratoId,
      clienteId: raw.clienteId,
      sectorId: raw.sectorId,
      categoriaTarifaId: raw.categoriaTarifaId,
      numeroGuia: raw.numeroGuia,
      fechaInicio: raw.fechaInicio,
      direccionSuministro: raw.direccionSuministro,
      estado: raw.estado,
      creadoPor: raw.creadoPor,
      comunidadId: raw.comunidadId,
      deletedAt: raw.deletedAt,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      categoriaTarifa: raw.categoriaTarifa
        ? {
            categoriaTarifaId: raw.categoriaTarifa.categoriaTarifaId,
            nombre: raw.categoriaTarifa.nombre,
            descripcion: raw.categoriaTarifa.descripcion,
            valorBase: Number(raw.categoriaTarifa.valorBase),
            consumoMinimoMensual: raw.categoriaTarifa.consumoMinimoMensual,
            valorExcedenteM3: raw.categoriaTarifa.valorExcedenteM3
              ? Number(raw.categoriaTarifa.valorExcedenteM3)
              : null,
          }
        : null,
      cliente: raw.cliente
        ? {
            clienteId: raw.cliente.clienteId,
            identificacion: raw.cliente.identificacion,
            nombres: raw.cliente.nombres,
            apellidos: raw.cliente.apellidos,
            razonSocial: raw.cliente.razonSocial,
            email: raw.cliente.email,
            telefono: raw.cliente.telefono,
            direccionDomicilio: raw.cliente.direccionDomicilio,
          }
        : null,
      comunidad: raw.comunidad
        ? {
            comunidadId: raw.comunidad.comunidadId,
            codigo: raw.comunidad.codigo,
            nombre: raw.comunidad.nombre,
          }
        : null,
      sector: raw.sector
        ? {
            sectorId: raw.sector.sectorId,
            codigo: raw.sector.codigo,
            nombre: raw.sector.nombre,
          }
        : null,
      historialMedidores: raw.historialMedidores
        ? raw.historialMedidores.map((h) => ({
            historialId: h.historialId,
            medidorId: h.medidorId,
            fechaDesde: h.fechaDesde,
            fechaHasta: h.fechaHasta,
            lecturaInicial: Number(h.lecturaInicial),
            lecturaFinal:
              h.lecturaFinal !== null && h.lecturaFinal !== undefined
                ? Number(h.lecturaFinal)
                : null,
            medidor: {
              medidorId: h.medidor.medidorId,
              serie: h.medidor.serie,
              marca: h.medidor.marca,
              modelo: h.medidor.modelo,
            },
            ultimaLecturaAprobada:
              h.fechaHasta === null &&
              h.medidor.lecturas?.[0] &&
              h.medidor.lecturas[0].fecha >= h.fechaDesde
                ? {
                    lecturaId: h.medidor.lecturas[0].lecturaId,
                    fecha: h.medidor.lecturas[0].fecha,
                    lecturaActual: Number(h.medidor.lecturas[0].lecturaActual),
                  }
                : null,
          }))
        : null,
    });
  }

  static toDomainList(rawList: ContractRecord[]): ContractEntity[] {
    return rawList
      .map((raw) => this.toDomain(raw))
      .filter((item): item is ContractEntity => item !== null);
  }
}
