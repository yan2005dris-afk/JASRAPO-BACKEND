import type { PrismaClient } from '../../../src/generated/prisma/client';

export async function seedCatalogosSriInit(prisma: PrismaClient) {
  // ─── Documentos Sustento (24 registros) ───
  const documentosSustento = [
    { codigo: '01', descripcion: 'FACTURA' },
    { codigo: '02', descripcion: 'NOTA O BOLETA DE VENTA' },
    {
      codigo: '03',
      descripcion: 'LIQUIDACIÓN DE COMPRA DE BIENES O PRESTACIÓN DE SERVICIOS',
    },
    { codigo: '04', descripcion: 'NOTA DE CRÉDITO' },
    { codigo: '05', descripcion: 'NOTA DE DÉBITO' },
    { codigo: '06', descripcion: 'GUÍA DE REMISIÓN' },
    { codigo: '07', descripcion: 'COMPROBANTE DE RETENCIÓN' },
    { codigo: '08', descripcion: 'BOLETOS O ENTRADAS A ESPECTÁCULOS PÚBLICOS' },
    {
      codigo: '09',
      descripcion: 'TIQUETES O VALES EMITIDOS POR MÁQUINAS REGISTRADORAS',
    },
    { codigo: '11', descripcion: 'PASAJES EXPEDIDOS POR EMPRESAS DE AVIACIÓN' },
    {
      codigo: '12',
      descripcion: 'DOCUMENTOS EMITIDOS POR INSTITUCIONES FINANCIERAS',
    },
    {
      codigo: '15',
      descripcion: 'COMPROBANTE DE VENTA EMITIDO EN EL EXTERIOR',
    },
    {
      codigo: '18',
      descripcion:
        'DOCUMENTOS AUTORIZADOS UTILIZADOS EN VENTAS EXCEPTO N/C N/D',
    },
    { codigo: '19', descripcion: 'COMPROBANTES DE PAGO DE CUOTAS O APORTES' },
    {
      codigo: '20',
      descripcion:
        'DOCUMENTOS POR SERVICIOS ADMINISTRADORAS DE TARJETA DE CRÉDITO',
    },
    { codigo: '21', descripcion: 'CARTA DE PORTE AÉREO' },
    { codigo: '41', descripcion: 'COMPROBANTE DE VENTA EMITIDO POR REEMBOLSO' },
    {
      codigo: '42',
      descripcion:
        'DOCUMENTO RETENCIÓN PRESUNTIVA Y RETENCIÓN EMITIDA POR PROPIO VENDEDOR',
    },
    {
      codigo: '43',
      descripcion:
        'LIQUIDACIÓN PARA EXPLOTACIÓN Y EXPLORACIÓN DE HIDROCARBUROS',
    },
    { codigo: '44', descripcion: 'COMPROBANTE DE CONTRIBUCIONES Y APORTES' },
    { codigo: '45', descripcion: 'LIQUIDACIÓN POR RECLAMOS DE ASEGURADORAS' },
    {
      codigo: '47',
      descripcion: 'NOTA DE CRÉDITO POR REEMBOLSO EMITIDA POR INTERMEDIARIO',
    },
    {
      codigo: '48',
      descripcion: 'NOTA DE DÉBITO POR REEMBOLSO EMITIDA POR INTERMEDIARIO',
    },
  ];

  for (const d of documentosSustento) {
    await prisma.catalogoDocumentosSustento.upsert({
      where: { codigo: d.codigo },
      update: {},
      create: d,
    });
  }
  console.log(
    `  ✅ ${documentosSustento.length} documentos sustento cargados.`,
  );

  // ─── Formas de Pago (8 registros) ───
  const formasPago = [
    { codigo: '01', descripcion: 'SIN UTILIZACION DEL SISTEMA FINANCIERO' },
    { codigo: '15', descripcion: 'COMPENSACIÓN DE DEUDAS' },
    { codigo: '16', descripcion: 'TARJETA DE DÉBITO' },
    { codigo: '17', descripcion: 'DINERO ELECTRÓNICO' },
    { codigo: '18', descripcion: 'TARJETA PREPAGO' },
    { codigo: '19', descripcion: 'TARJETA DE CRÉDITO' },
    {
      codigo: '20',
      descripcion: 'OTROS CON UTILIZACIÓN DEL SISTEMA FINANCIERO',
    },
    { codigo: '21', descripcion: 'ENDOSO DE TÍTULOS' },
  ];

  for (const f of formasPago) {
    await prisma.catalogoFormasPago.upsert({
      where: { codigo: f.codigo },
      update: {},
      create: f,
    });
  }
  console.log(`  ✅ ${formasPago.length} formas de pago cargadas.`);

  // ─── Impuestos (3 registros) ───
  const impuestos = [
    { codigo: '2', nombre: 'IVA', descripcion: 'Impuesto al Valor Agregado' },
    {
      codigo: '3',
      nombre: 'ICE',
      descripcion: 'Impuesto a los Consumos Especiales',
    },
    {
      codigo: '5',
      nombre: 'IRBPNR',
      descripcion: 'Impuesto Redimible Botellas Plásticas No Retornables',
    },
  ];

  const impuestoIds: Record<string, number> = {};
  for (const i of impuestos) {
    const result = await prisma.catalogoImpuestos.upsert({
      where: { codigo: i.codigo },
      update: {},
      create: i,
    });
    impuestoIds[i.codigo] = result.id;
  }
  console.log(`  ✅ ${impuestos.length} impuestos cargados.`);

  // ─── Tarifas de Impuesto (8 registros, todas de IVA) ───
  const tarifas = [
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '0',
      descripcion: 'IVA 0%',
      porcentaje: 0.0,
      vigenteDesde: '2024-01-01',
    },
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '2',
      descripcion: 'IVA 12%',
      porcentaje: 12.0,
      vigenteDesde: '2024-01-01',
    },
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '3',
      descripcion: 'IVA 14%',
      porcentaje: 14.0,
      vigenteDesde: '2024-01-01',
    },
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '4',
      descripcion: 'IVA 15%',
      porcentaje: 15.0,
      vigenteDesde: '2024-04-01',
    },
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '5',
      descripcion: 'IVA 5%',
      porcentaje: 5.0,
      vigenteDesde: '2024-01-01',
    },
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '6',
      descripcion: 'No Objeto de Impuesto',
      porcentaje: 0.0,
      vigenteDesde: '2024-01-01',
    },
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '7',
      descripcion: 'Exento de IVA',
      porcentaje: 0.0,
      vigenteDesde: '2024-01-01',
    },
    {
      impuestoCodigo: '2',
      codigoPorcentaje: '8',
      descripcion: 'IVA Diferenciado',
      porcentaje: 0.0,
      vigenteDesde: '2024-01-01',
    },
  ];

  for (const t of tarifas) {
    const impuestoId = impuestoIds[t.impuestoCodigo];
    const vigenteDesde = new Date(t.vigenteDesde);
    await prisma.catalogoTarifasImpuesto.upsert({
      where: {
        impuestoId_codigoPorcentaje_vigenteDesde: {
          impuestoId,
          codigoPorcentaje: t.codigoPorcentaje,
          vigenteDesde,
        },
      },
      update: {},
      create: {
        impuestoId,
        codigoPorcentaje: t.codigoPorcentaje,
        descripcion: t.descripcion,
        porcentaje: t.porcentaje,
        vigenteDesde,
      },
    });
  }
  console.log(`  ✅ ${tarifas.length} tarifas de impuesto cargadas.`);

  // ─── Retenciones (23 registros) ───
  const retenciones = [
    {
      tipo: 'RENTA',
      codigo: '303',
      descripcion: 'Honorarios profesionales y dietas',
      porcentaje: 10.0,
    },
    {
      tipo: 'RENTA',
      codigo: '304',
      descripcion: 'Servicios predomina mano de obra',
      porcentaje: 2.0,
    },
    {
      tipo: 'RENTA',
      codigo: '307',
      descripcion: 'Servicios predomina intelecto',
      porcentaje: 2.0,
    },
    {
      tipo: 'RENTA',
      codigo: '308',
      descripcion: 'Servicios publicidad y comunicación',
      porcentaje: 1.0,
    },
    {
      tipo: 'RENTA',
      codigo: '309',
      descripcion:
        'Transporte privado de pasajeros o servicio público o privado de carga',
      porcentaje: 1.0,
    },
    {
      tipo: 'RENTA',
      codigo: '310',
      descripcion: 'Transferencia de bienes muebles de naturaleza corporal',
      porcentaje: 1.0,
    },
    {
      tipo: 'RENTA',
      codigo: '312',
      descripcion: 'Transferencia de bienes inmuebles',
      porcentaje: 1.75,
    },
    {
      tipo: 'RENTA',
      codigo: '319',
      descripcion: 'Arrendamiento mercantil',
      porcentaje: 1.0,
    },
    {
      tipo: 'RENTA',
      codigo: '320',
      descripcion: 'Arrendamiento bienes inmuebles',
      porcentaje: 8.0,
    },
    {
      tipo: 'RENTA',
      codigo: '322',
      descripcion: 'Seguros y reaseguros (primas y cesiones)',
      porcentaje: 1.0,
    },
    {
      tipo: 'RENTA',
      codigo: '323',
      descripcion: 'Rendimientos financieros',
      porcentaje: 2.0,
    },
    {
      tipo: 'RENTA',
      codigo: '332',
      descripcion: 'Otras compras bienes y servicios no sujetas',
      porcentaje: 0.0,
    },
    {
      tipo: 'RENTA',
      codigo: '340',
      descripcion: 'Aplicables el 1%',
      porcentaje: 1.0,
    },
    {
      tipo: 'RENTA',
      codigo: '341',
      descripcion: 'Aplicables el 2%',
      porcentaje: 2.0,
    },
    {
      tipo: 'RENTA',
      codigo: '342',
      descripcion: 'Aplicables el 8%',
      porcentaje: 8.0,
    },
    {
      tipo: 'RENTA',
      codigo: '343',
      descripcion: 'Aplicables el 25%',
      porcentaje: 25.0,
    },
    {
      tipo: 'RENTA',
      codigo: '344',
      descripcion: 'Aplicables a otros porcentajes',
      porcentaje: 0.0,
    },
    {
      tipo: 'IVA',
      codigo: '721',
      descripcion: 'Retención 30% IVA Bienes',
      porcentaje: 30.0,
    },
    {
      tipo: 'IVA',
      codigo: '723',
      descripcion: 'Retención 70% IVA Servicios',
      porcentaje: 70.0,
    },
    {
      tipo: 'IVA',
      codigo: '725',
      descripcion: 'Retención 100% IVA',
      porcentaje: 100.0,
    },
    {
      tipo: 'IVA',
      codigo: '727',
      descripcion: 'Retención 10% IVA Bienes',
      porcentaje: 10.0,
    },
    {
      tipo: 'IVA',
      codigo: '729',
      descripcion: 'Retención 20% IVA Servicios',
      porcentaje: 20.0,
    },
    {
      tipo: 'IVA',
      codigo: '731',
      descripcion: 'Retención 50% IVA Derivados Petróleo',
      porcentaje: 50.0,
    },
    {
      tipo: 'ISD',
      codigo: '4580',
      descripcion: 'Retención ISD',
      porcentaje: 5.0,
    },
  ];

  for (const r of retenciones) {
    const vigenteDesde = new Date('2024-01-01');
    await prisma.catalogoRetenciones.upsert({
      where: {
        tipo_codigo_vigenteDesde: {
          tipo: r.tipo,
          codigo: r.codigo,
          vigenteDesde,
        },
      },
      update: {},
      create: {
        ...r,
        vigenteDesde,
      },
    });
  }
  console.log(`  ✅ ${retenciones.length} retenciones cargadas.`);

  // ─── Tipos de Identificación (5 registros) ───
  const tiposIdentificacion = [
    {
      codigo: '04',
      descripcion: 'RUC',
      longitud: 13,
      regexValidacion: '^\\d{13}$',
    },
    {
      codigo: '05',
      descripcion: 'CÉDULA',
      longitud: 10,
      regexValidacion: '^\\d{10}$',
    },
    {
      codigo: '06',
      descripcion: 'PASAPORTE',
      longitud: null,
      regexValidacion: '^[A-Za-z0-9]+$',
    },
    {
      codigo: '07',
      descripcion: 'CONSUMIDOR FINAL',
      longitud: 13,
      regexValidacion: '^9{13}$',
    },
    {
      codigo: '08',
      descripcion: 'IDENTIFICACIÓN DEL EXTERIOR',
      longitud: null,
      regexValidacion: '^[A-Za-z0-9]+$',
    },
  ];

  for (const t of tiposIdentificacion) {
    await prisma.catalogoTiposIdentificacion.upsert({
      where: { codigo: t.codigo },
      update: {},
      create: t,
    });
  }
  console.log(
    `  ✅ ${tiposIdentificacion.length} tipos de identificación cargados.`,
  );

  // ─── Sistema Config (5 registros) ───
  const sistemaConfig = [
    {
      clave: 'SRI_SYNC_MAX_LIMIT',
      valor: '500',
      descripcion: 'Límite máximo de comprobantes a sincronizar por lote',
    },
    {
      clave: 'SRI_MAX_RETRIES',
      valor: '3',
      descripcion: 'Número máximo de reintentos para consultas al SRI',
    },
    {
      clave: 'SRI_RETRY_DELAY_MS',
      valor: '2000',
      descripcion: 'Retraso entre reintentos en milisegundos',
    },
    {
      clave: 'CACHE_EMISOR_TTL_MS',
      valor: '3600000',
      descripcion: 'TTL de la caché de emisores (1 hora)',
    },
    {
      clave: 'CACHE_CERT_TTL_MS',
      valor: '3600000',
      descripcion: 'TTL de la caché de certificados (1 hora)',
    },
    {
      clave: 'reporte.estilo.default',
      valor: 'modern',
      descripcion: 'Estilo por defecto para todos los reportes (legacy|modern)',
    },
    {
      clave: 'reporte.estilo.payments-report',
      valor: 'modern',
      descripcion: 'Estilo del reporte "Reporte de Pagos" (legacy|modern)',
    },
    {
      clave: 'reporte.estilo.connection-history',
      valor: 'modern',
      descripcion: 'Estilo del reporte "Historial de Conexiones" (legacy|modern)',
    },
    {
      clave: 'reporte.estilo.payment-agreement',
      valor: 'modern',
      descripcion: 'Estilo del reporte "Convenio de Pago" (legacy|modern)',
    },
  ];

  for (const s of sistemaConfig) {
    await prisma.sistemaConfig.upsert({
      where: { clave: s.clave },
      update: {},
      create: s,
    });
  }
  console.log(
    `  ✅ ${sistemaConfig.length} configuraciones de sistema cargadas.`,
  );
}
