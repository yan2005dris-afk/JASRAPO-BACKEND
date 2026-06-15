import { Injectable, NotFoundException } from '@nestjs/common';
import { ContractRepository } from '../../domain/repositories/contract.repository';

/**
 * Datos planos que necesita la plantilla PDF de Solicitud de Conexión.
 */
export interface ConnectionRequestPdfRawData {
  solicitud: {
    numero: string;
    cliente: {
      nombres: string;
      apellidos: string;
      razonSocial: string | null;
      identificacion: string;
      email: string | null;
      telefono: string | null;
      direccionDomicilio: string | null;
    };
    contrato: {
      numeroGuia: string;
      direccionSuministro: string;
      fechaInicio: string;
      comunidad: { nombre: string };
      sector: { nombre: string } | null;
    };
    tarifa: {
      nombre: string;
      tipo: string;
      valorBase: number;
      consumoMinimoMensual: number;
      valorExcedenteM3: number;
    };
    costos: {
      derechoInspeccion: number;
      costoGuia: number;
      materialesExtras: number;
      iva: number;
      total: number;
    };
    formaPago: string;
    fechaEmision: string;
  };
}

@Injectable()
export class GetConnectionRequestPdfDataUseCase {
  constructor(private readonly contractRepository: ContractRepository) {}

  async execute(contratoId: bigint): Promise<ConnectionRequestPdfRawData> {
    const contrato = await this.contractRepository.findUnique({
      contratoId,
    });

    if (!contrato || contrato.deletedAt) {
      throw new NotFoundException(
        `Contrato con ID ${contratoId} no encontrado`,
      );
    }

    const tipoNombre = contrato.categoriaTarifa?.nombre ?? 'Tipo 1';
    const costoGuia = tipoNombre.includes('1')
      ? 120
      : tipoNombre.includes('2')
        ? 150
        : 200;
    const derechoInspeccion = 3.0;
    const costoTotal = derechoInspeccion + costoGuia;

    return {
      solicitud: {
        numero: String(contrato.contratoId),
        cliente: {
          nombres: contrato.cliente?.nombres ?? '',
          apellidos: contrato.cliente?.apellidos ?? '',
          razonSocial: contrato.cliente?.razonSocial ?? null,
          identificacion: contrato.cliente?.identificacion ?? '',
          email: contrato.cliente?.email ?? null,
          telefono: contrato.cliente?.telefono ?? null,
          direccionDomicilio: contrato.cliente?.direccionDomicilio ?? null,
        },
        contrato: {
          numeroGuia: contrato.numeroGuia,
          direccionSuministro: contrato.direccionSuministro,
          fechaInicio: contrato.fechaInicio.toISOString(),
          comunidad: { nombre: contrato.comunidad?.nombre ?? '' },
          sector: contrato.sector
            ? { nombre: contrato.sector.nombre }
            : null,
        },
        tarifa: {
          nombre: tipoNombre,
          tipo: tipoNombre,
          valorBase: Number(contrato.categoriaTarifa?.valorBase ?? 4),
          consumoMinimoMensual:
            contrato.categoriaTarifa?.consumoMinimoMensual ?? 10,
          valorExcedenteM3: Number(
            contrato.categoriaTarifa?.valorExcedenteM3 ?? 0.4,
          ),
        },
        costos: {
          derechoInspeccion,
          costoGuia,
          materialesExtras: 0,
          iva: 0,
          total: costoTotal,
        },
        formaPago: 'CONTADO',
        fechaEmision: new Date().toLocaleDateString('es-EC'),
      },
    };
  }
}
