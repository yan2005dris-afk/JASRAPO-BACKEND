import type { PrismaClient } from 'src/generated/prisma/client';

/**
 * Seed de Rubros.
 * Requiere que los catálogos SRI ya estén cargados (seedCatalogosSriInit).
 * Incluye los rubros por categoría, servicios operativos, bienes y multas,
 * más un rubro de Guía de Remisión por cada categoría de tarifa.
 */
export async function seedRubros(prisma: PrismaClient) {
  // Lookup tariff IDs from new catalog tables (seeded by seedCatalogosSriInit)
  const ivaImpuesto = await prisma.catalogoImpuestos.findUnique({
    where: { codigo: '2' },
  });
  if (!ivaImpuesto)
    throw new Error('IVA impuesto not found in catalog — seed order issue');
  const tarifaIva0 = await prisma.catalogoTarifasImpuesto.findFirst({
    where: { impuestoId: ivaImpuesto.id, codigoPorcentaje: '0' },
  });
  const tarifaIva15 = await prisma.catalogoTarifasImpuesto.findFirst({
    where: { impuestoId: ivaImpuesto.id, codigoPorcentaje: '4' },
  });
  if (!tarifaIva0 || !tarifaIva15)
    throw new Error(
      'IVA tariff records (0% / 15%) not found — seed order issue',
    );

  await prisma.rubros.createMany({
    data: [
      // ─── Categoría 1: RESIDENCIAL ───
      {
        codigoSri: '001',
        nombre: 'Cargo Fijo Residencial',
        descripcion: 'Valor base mensual de conexión residencial',
        precioUnitario: 4.0,
        tipoRubro: 'FIJO' as any,
        categoriaTarifaId: 1,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
      {
        codigoSri: '002',
        nombre: 'Consumo Agua Residencial',
        descripcion: 'Consumo por m³ de agua potable residencial',
        precioUnitario: 0.4,
        tipoRubro: 'VARIABLE' as any,
        categoriaTarifaId: 1,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
      {
        codigoSri: 'SERV-GUIA-RES-01',
        nombre: 'Guía de Remisión Residencial',
        descripcion:
          'Tasa administrativa por emisión y autorización de guía de remisión para clientes residenciales',
        precioUnitario: 1.0,
        tipoRubro: 'SERVICIO' as any,
        categoriaTarifaId: 1,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },

      // ─── Categoría 2: COMERCIAL ───
      {
        codigoSri: '001',
        nombre: 'Cargo Fijo Comercial',
        descripcion: 'Valor base mensual de conexión comercial',
        precioUnitario: 7.5,
        tipoRubro: 'FIJO' as any,
        categoriaTarifaId: 2,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
      {
        codigoSri: '002',
        nombre: 'Consumo Agua Comercial',
        descripcion: 'Consumo por m³ de agua potable comercial',
        precioUnitario: 0.75,
        tipoRubro: 'VARIABLE' as any,
        categoriaTarifaId: 2,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
      {
        codigoSri: 'SERV-GUIA-COM-01',
        nombre: 'Guía de Remisión Comercial',
        descripcion:
          'Tasa administrativa por emisión y autorización de guía de remisión para clientes comerciales',
        precioUnitario: 2.0,
        tipoRubro: 'SERVICIO' as any,
        categoriaTarifaId: 2,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },

      // ─── Categoría 3: INDUSTRIAL ───
      {
        codigoSri: '001',
        nombre: 'Cargo Fijo Industrial',
        descripcion: 'Valor base mensual de conexión industrial',
        precioUnitario: 15.0,
        tipoRubro: 'FIJO' as any,
        categoriaTarifaId: 3,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
      {
        codigoSri: '002',
        nombre: 'Consumo Agua Industrial',
        descripcion: 'Consumo por m³ de agua potable industrial',
        precioUnitario: 1.5,
        tipoRubro: 'VARIABLE' as any,
        categoriaTarifaId: 3,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
      {
        codigoSri: 'SERV-GUIA-IND-01',
        nombre: 'Guía de Remisión Industrial',
        descripcion:
          'Tasa administrativa por emisión y autorización de guía de remisión para clientes industriales',
        precioUnitario: 5.0,
        tipoRubro: 'SERVICIO' as any,
        categoriaTarifaId: 3,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },

      // ─── SERVICIOS OPERATIVOS (IVA 15%) ───
      {
        codigoSri: 'SERV-INST-01',
        nombre: 'Instalación y Acometida Tipo 1 (Básica)',
        descripcion:
          'Mano de obra y servicio técnico de instalación de acometida corta (hasta 10m)',
        precioUnitario: 50.0,
        tipoRubro: 'SERVICIO' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'SERV-INST-02',
        nombre: 'Instalación y Acometida Tipo 2 (Extendida)',
        descripcion:
          'Mano de obra y servicio técnico de instalación de acometida larga / cruce de vía',
        precioUnitario: 90.0,
        tipoRubro: 'SERVICIO' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'SERV-REC-01',
        nombre: 'Servicio de Reconexión',
        descripcion: 'Reconexión del suministro tras corte o suspensión',
        precioUnitario: 10.0,
        tipoRubro: 'SERVICIO' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'SERV-INSP-01',
        nombre: 'Servicio de Inspección Técnica',
        descripcion: 'Inspección de fugas, presión o verificación de acometida',
        precioUnitario: 5.0,
        tipoRubro: 'SERVICIO' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'SERV-GUIA-01',
        nombre: 'Emisión de Guía de Remisión Tipo 1 (Transporte Local)',
        descripcion:
          'Tasa administrativa por emisión y autorización de guía de remisión local',
        precioUnitario: 1.0,
        tipoRubro: 'SERVICIO' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'SERV-GUIA-02',
        nombre: 'Emisión de Guía de Remisión Tipo 2 (Interprovincial)',
        descripcion:
          'Tasa administrativa por emisión de guía de remisión para transporte de materiales',
        precioUnitario: 2.0,
        tipoRubro: 'SERVICIO' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },

      // ─── BIENES Y MATERIALES (IVA 15%) ───
      {
        codigoSri: 'BIEN-MED-01',
        nombre: 'Medidor de Agua Chorro Único 1/2 pulgada',
        descripcion: 'Medidor volumétrico certificado clase B con acoples',
        precioUnitario: 35.0,
        tipoRubro: 'BIEN' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'BIEN-MED-02',
        nombre: 'Medidor de Agua Chorro Múltiple 3/4 pulgada',
        descripcion:
          'Medidor de alta precisión para acometidas comerciales/industriales',
        precioUnitario: 55.0,
        tipoRubro: 'BIEN' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'BIEN-CAJA-01',
        nombre: 'Caja Protectora de Medidor con Tapa',
        descripcion: 'Caja plástica de alta resistencia para intemperie',
        precioUnitario: 12.0,
        tipoRubro: 'BIEN' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'BIEN-LLAV-01',
        nombre: 'Válvula de Paso / Llave de Corte Antifraude',
        descripcion:
          'Llave de paso esférica de bronce con candado de seguridad',
        precioUnitario: 8.5,
        tipoRubro: 'BIEN' as any,
        tarifaImpuestoId: tarifaIva15.id,
        esAutomatico: false,
      },

      // ─── SANCIONES, MULTAS Y TASAS (IVA 0%) ───
      {
        codigoSri: 'MULT-MORA-01',
        nombre: 'Interés por Mora',
        descripcion: 'Recargo legal por mora en planillas vencidas',
        precioUnitario: 0.5,
        tipoRubro: 'MULTA' as any,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
      {
        codigoSri: 'MULT-BYPASS-01',
        nombre: 'Multa por Infracción o Conexión Clandestina',
        descripcion:
          'Sanción por bypass, ruptura de sellos o manipulación de medidor',
        precioUnitario: 50.0,
        tipoRubro: 'MULTA' as any,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: false,
      },
      {
        codigoSri: 'TASA-SEG-01',
        nombre: 'Tasa de Seguridad y Vigilancia de Redes',
        descripcion:
          'Aporte comunitario de seguridad y preservación de fuentes de agua',
        precioUnitario: 1.0,
        tipoRubro: 'FIJO' as any,
        tarifaImpuestoId: tarifaIva0.id,
        esAutomatico: true,
      },
    ],
    skipDuplicates: true,
  });
}
