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
import { seedRubros } from './seeds/rubros.seed';
import { seedFacturacion } from './seeds/facturacion.seed';
import { seedSriCatalogs } from './seeds/sri.seed';
import { seedCatalogosSriInit } from './seeds/catalogosSriInit.seed';
import { seedRoutes } from './seeds/routes.seed';
import { seedAgreements } from './seeds/agreements.seed';
import { seedAgreementsPrefacturas } from './seeds/agreements-prefacturas.seed';
import { seedPagos } from './seeds/pagos.seed';
import { syncSequences } from './seeds/sync-sequences';
import { seedInstitutionalProfile } from './seeds/institutional-profile.seed';

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

  await seedInstitutionalProfile(prisma);
  console.log('✅ Perfil institucional y activos de marca creados.');

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

  // Rubros — extraído a seeds/rubros.seed.ts (requiere catálogos SRI cargados)
  await seedRubros(prisma);
  console.log('✅ Rubros creados con asignación a categorías.');

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
