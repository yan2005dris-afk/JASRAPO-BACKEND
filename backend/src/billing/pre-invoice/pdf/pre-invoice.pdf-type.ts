import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';

/**
 * Documento tipo Prefactura.
 *
 * Mapea los datos de la prefactura al documento Prefactura.
 */
export const PreInvoicePdfDocumentType: PdfDocumentType = {
  type: 'pre-invoice',
  name: 'Prefactura',
  template: 'pre-invoice',

  adaptData(raw: Record<string, any>): Record<string, any> {
    return {
      prefactura: {
        prefacturaId: raw.prefacturaId,
        clienteNombre: raw.cliente?.clienteNombre ?? raw.clienteNombre,
        clienteIdentificacion: raw.cliente?.clienteIdentificacion ?? raw.clienteIdentificacion,
        clienteDireccion: raw.cliente?.clienteDireccion ?? raw.clienteDireccion,
        clienteEmail: raw.cliente?.clienteEmail ?? raw.clienteEmail,
        subtotal: raw.subtotal,
        iva: raw.iva,
        descuentoTotal: raw.descuentoTotal,
        totalPagar: raw.totalPagar,
        interesMora: raw.interesMora,
        deudaAnterior: raw.deudaAnterior,
        createdAt: raw.createdAt,
        contrato: {
          numeroGuia: raw.contrato?.numeroGuia ?? raw.numeroGuia ?? '',
        },
        periodo: {
          nombre: raw.periodo?.nombre ?? raw.periodoNombre ?? '',
          fechaVencimiento: raw.periodo?.fechaVencimiento ?? raw.fechaVencimiento ?? '',
        },
        detalles: (raw.detalles ?? raw.prefacturaDetalle ?? []).map((d: any) => ({
          descripcion: d.descripcion,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
          subtotal: d.subtotal,
          iva: d.iva,
          total: d.total,
        })),
      },
    };
  },
};
