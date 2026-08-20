import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
dotenv.config({ path: path.resolve(__dirname, '../../..', '.env') });
import { Pool } from 'pg';
import { PrismaClient } from '../../src/generated/prisma/client';
import { seedMenus } from './seeds/menu.seed';
import { seedMenuPermissions } from './seeds/menuPermission.seed';
import { seedPermissions } from './seeds/permission.seed';
import { seedRoles } from './seeds/role.seed';
import { seedRolePermissions } from './seeds/rolePermission.seed';
import { seedUSers } from './seeds/user.seed';
import { seedComunidades } from './seeds/comunidades.seed';
import { seedSectores } from './seeds/sectores.seed';
import { seedCategoriaTarifa } from './seeds/categoriaTarifa.seed';
import { seedMedidores } from './seeds/medidores.seed';
import { seedClientes } from './seeds/clientes.seed';
import { seedContratos } from './seeds/contratos.seed';
import { seedPeriodos } from './seeds/periodos.seed';
import { seedLecturas } from './seeds/lecturas.seed';
import { seedCatalogoDescuento } from './seeds/catalogoDescuento.seed';
import { seedFacturacion } from './seeds/facturacion.seed';
import { seedSriCatalogs } from './seeds/sri.seed';
import { seedCatalogosSriInit } from './seeds/catalogosSriInit.seed';
import { seedRoutes } from './seeds/routes.seed';
import { seedAgreements } from './seeds/agreements.seed';
import { seedAgreementsPrefacturas } from './seeds/agreements-prefacturas.seed';
import { seedPagos } from './seeds/pagos.seed';
import { syncSequences } from './seeds/sync-sequences';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Seeding database...');

  console.log('🧹 Limpiando base de datos...');
  try {
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(
        `TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`,
      );
    }
    console.log('✅ Base de datos limpiada correctamente desde 0.');
  } catch (error) {
    console.error('❌ Error limpiando base de datos', error);
  }

  // Roles
  const roles = await seedRoles(prisma);
  console.log('✅ Roles creados correctamente.');

  // Permisos
  const permissions = await seedPermissions(prisma);
  console.log('✅ Permisos creados correctamente.');

  // Roles-Permisos
  await seedRolePermissions(prisma, roles, permissions);
  console.log('✅ Roles y Permisos asignados correctamente.');

  // Usuarios
  await seedUSers(prisma, roles);
  console.log('✅ Usuarios creados correctamente.');

  // Menus
  const menus = await seedMenus(prisma);
  console.log('✅ Menus creados correctamente.');

  // Menus-Permisos
  await seedMenuPermissions(prisma, menus, permissions);
  console.log('✅ Permisos asignados a Menus correctamente.');

  // SRI Catalogs (legacy)
  console.log('🏛️ Cargando catálogos SRI (legacy)...');
  await seedSriCatalogs(prisma);
  console.log('✅ Catálogos SRI (legacy) cargados.');

  // SRI Catalogs (init.sql — modelos nuevos priorizando estructura de referencia)
  console.log('📋 Cargando catálogos SRI desde init.sql...');
  await seedCatalogosSriInit(prisma);
  console.log('✅ Catálogos SRI desde init.sql cargados.');

  // === SEEDS DE LÓGICA DE NEGOCIO ===
  console.log('🏗️ Cargando datos de lógica de negocio...');
  await seedComunidades(prisma);
  console.log('✅ Comunidades creadas.');

  await seedSectores(prisma);
  console.log('✅ Sectores creados.');

  await seedCategoriaTarifa(prisma);
  console.log('✅ Categorías de tarifa creadas.');

  // Medidores
  await seedMedidores(prisma);
  console.log('✅ Medidores creados.');

  await seedClientes(prisma);
  console.log('✅ Clientes creados.');

  await seedContratos(prisma);
  console.log('✅ Contratos creados.');

  await seedPeriodos(prisma);
  console.log('✅ Períodos creados.');

  await seedLecturas(prisma);
  console.log('✅ Lecturas creadas.');

  // === DATOS PARA PROBAR SP DE FACTURACIÓN ===
  console.log('📦 Creando datos de facturación...');

  // Catálogo de Descuentos
  await seedCatalogoDescuento(prisma);
  console.log('✅ Catálogo de descuentos creado.');

  // Rubros — lookup tariff IDs from new catalog tables (seeded by seedCatalogosSriInit above)
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
  console.log('✅ Rubros creados con asignación a categorías');

  // === FACTURACIÓN ===
  await seedFacturacion(prisma);
  console.log('✅ Datos de facturación creados.');

  // === PREFACTURAS PARA AGREEMENTS ===
  await seedAgreementsPrefacturas(prisma);

  // === RUTAS Y ÓRDENES DE TRABAJO ===
  await seedRoutes(prisma);
  console.log('✅ Rutas y órdenes de trabajo creadas correctamente.');

  // === AGREEMENTS ===
  await seedAgreements(prisma);

  // === SINCRONIZACIÓN FINAL ===
  // Esto asegura que los autoincrementales empiecen después de los IDs manuales del seed
  await syncSequences(prisma);

  console.log('✅ Seed completado exitosamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error('❌ Error desconectando Prisma:', error);
    }

    try {
      await pool.end();
    } catch (error) {
      console.error('❌ Error cerrando el pool de conexiones de pg:', error);
    }
  });
