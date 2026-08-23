import type { PdfDocumentType } from 'src/infrastructure/pdf/document-type.interface';

export const SriDocumentPdfType: PdfDocumentType = {
  type: 'sri-document',
  name: 'Documento SRI (RIDE)',
  template: 'sri-document',
  adaptData(raw: Record<string, any>): Record<string, any> {
    const emisor = raw.emisor || {};
    const comprador = raw.comprador || {};
    const infoTributaria = raw.infoTributaria || {};
    const infoFactura = raw.infoFactura || {};
    const detalles = raw.detalles || raw.items || [];
    const infoAdicional = raw.infoAdicional || [];
    const pagos = raw.pagos || [];

    const claveAcceso =
      raw.claveAcceso ||
      infoTributaria.claveAcceso ||
      '0000000000000000000000000000000000000000000000000';
    const estab = infoTributaria.estab || emisor.establecimiento || '001';
    const ptoEmi = infoTributaria.ptoEmi || emisor.puntoEmision || '001';
    const secuencial = String(
      infoTributaria.secuencial || raw.secuencial || '000000001',
    ).padStart(9, '0');

    return {
      tipoDocumento: raw.tipoDocumento || 'FACTURA',
      numeroComprobante: `${estab}-${ptoEmi}-${secuencial}`,
      numeroAutorizacion: raw.numeroAutorizacion || claveAcceso,
      fechaAutorizacion:
        raw.fechaAutorizacion ||
        new Date().toLocaleString('es-EC', { timeZone: 'America/Guayaquil' }),
      ambiente:
        raw.ambiente === '2' || raw.ambiente === 2 ? 'PRODUCCIÓN' : 'PRUEBAS',
      tipoEmision:
        raw.tipoEmision === '2' || raw.tipoEmision === 2
          ? 'CONTINGENCIA'
          : 'NORMAL',
      claveAcceso,
      fechaEmision:
        raw.fechaEmision ||
        infoFactura.fechaEmision ||
        new Date().toLocaleDateString('es-EC'),
      emisor: {
        ruc: emisor.ruc || infoTributaria.ruc || '0999999999001',
        razonSocial:
          emisor.razonSocial ||
          infoTributaria.razonSocial ||
          'JUNTA ADMINISTRADORA DE AGUA POTABLE',
        nombreComercial:
          emisor.nombreComercial || infoTributaria.nombreComercial || '',
        dirMatriz:
          emisor.dirMatriz || infoTributaria.dirMatriz || 'Matriz Principal',
        dirEstablecimiento: emisor.dirEstablecimiento || 'Sucursal Principal',
        contribuyenteEspecial: emisor.contribuyenteEspecial || '',
        obligadoContabilidad: emisor.obligadoContabilidad ?? false,
        regimenRimpe: emisor.regimenRimpe || '',
        logoUrl: emisor.logoUrl || null,
      },
      comprador: {
        razonSocial:
          comprador.razonSocial ||
          comprador.nombre ||
          infoFactura.razonSocialComprador ||
          'CONSUMIDOR FINAL',
        identificacion:
          comprador.identificacion ||
          infoFactura.identificacionComprador ||
          '9999999999999',
        direccion:
          comprador.direccion || infoFactura.direccionComprador || 'S/N',
        email: comprador.email || '',
        guiaRemision: comprador.guiaRemision || '—',
      },
      detalles: detalles.map((d: any) => ({
        codigoPrincipal: d.codigoPrincipal || d.codigo || '001',
        cantidad: d.cantidad || 1,
        descripcion: d.descripcion || 'Servicio de Agua Potable',
        precioUnitario: Number(d.precioUnitario || 0).toFixed(2),
        descuento: Number(d.descuento || 0).toFixed(2),
        precioTotalSinImpuesto: Number(
          d.precioTotalSinImpuesto || d.total || 0,
        ).toFixed(2),
      })),
      infoAdicional: Array.isArray(infoAdicional)
        ? infoAdicional
        : Object.entries(infoAdicional).map(([k, v]) => ({
            nombre: k,
            valor: v,
          })),
      pagos: pagos.map((p: any) => ({
        formaPago:
          p.formaPago || p.metodo || 'SIN UTILIZACIÓN DEL SISTEMA FINANCIERO',
        total: Number(p.total || 0).toFixed(2),
        plazo: p.plazo || 0,
        unidadTiempo: p.unidadTiempo || 'días',
      })),
      totales: {
        subtotal15: Number(raw.totales?.subtotal15 || 0).toFixed(2),
        subtotal0: Number(
          raw.totales?.subtotal0 || raw.totalSinImpuestos || 0,
        ).toFixed(2),
        subtotalNoObjeto: Number(raw.totales?.subtotalNoObjeto || 0).toFixed(2),
        subtotalExento: Number(raw.totales?.subtotalExento || 0).toFixed(2),
        totalSinImpuestos: Number(
          raw.totalSinImpuestos || raw.totales?.totalSinImpuestos || 0,
        ).toFixed(2),
        totalDescuento: Number(raw.totalDescuento || 0).toFixed(2),
        iva15: Number(raw.totales?.iva15 || raw.totalIva || 0).toFixed(2),
        importeTotal: Number(raw.importeTotal || raw.totalPagar || 0).toFixed(
          2,
        ),
      },
    };
  },
};
