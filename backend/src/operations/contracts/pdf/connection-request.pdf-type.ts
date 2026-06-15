import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';

/**
 * Documento tipo Solicitud de Conexión de Agua Potable.
 *
 * Mapea los datos del contrato al documento Solicitud de Conexión de Agua Potable.
 */
export const ConnectionRequestPdfDocumentType: PdfDocumentType = {
  type: 'connection-request',
  name: 'Solicitud para Conexión de Agua Potable',
  template: 'connection-request',

  adaptData(raw: Record<string, any>): Record<string, any> {
    const solicitud = raw.solicitud ?? raw;
    return {
      solicitud: {
        numero: solicitud.numero ?? '',
        cliente: {
          nombres: solicitud.cliente?.nombres ?? '',
          apellidos: solicitud.cliente?.apellidos ?? '',
          razonSocial: solicitud.cliente?.razonSocial ?? null,
          identificacion: solicitud.cliente?.identificacion ?? '',
          email: solicitud.cliente?.email ?? '',
          telefono: solicitud.cliente?.telefono ?? '',
          direccionDomicilio: solicitud.cliente?.direccionDomicilio ?? '',
        },
        contrato: {
          numeroGuia: solicitud.contrato?.numeroGuia ?? '',
          direccionSuministro: solicitud.contrato?.direccionSuministro ?? '',
          fechaInicio: solicitud.contrato?.fechaInicio ?? '',
          comunidad: { nombre: solicitud.contrato?.comunidad?.nombre ?? '' },
          sector: solicitud.contrato?.sector ? { nombre: solicitud.contrato.sector.nombre } : null,
        },
        tarifa: {
          nombre: solicitud.tarifa?.nombre ?? '',
          tipo: solicitud.tarifa?.tipo ?? '',
          valorBase: solicitud.tarifa?.valorBase ?? 0,
          consumoMinimoMensual: solicitud.tarifa?.consumoMinimoMensual ?? 10,
          valorExcedenteM3: solicitud.tarifa?.valorExcedenteM3 ?? 0,
        },
        costos: {
          derechoInspeccion: (solicitud.costos?.derechoInspeccion ?? 3).toFixed(2),
          costoGuia: (solicitud.costos?.costoGuia ?? 0).toFixed(2),
          materialesExtras: (solicitud.costos?.materialesExtras ?? 0).toFixed(2),
          iva: (solicitud.costos?.iva ?? 0).toFixed(2),
          total: (solicitud.costos?.total ?? 0).toFixed(2),
        },
        formaPago: solicitud.formaPago ?? 'CONTADO',
        fechaEmision: solicitud.fechaEmision ?? '',
      },
    };
  },
};
