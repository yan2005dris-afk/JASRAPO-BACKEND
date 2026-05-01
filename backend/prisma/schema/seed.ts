import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
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
import { seedClientes } from './seeds/clientes.seed';
import { seedContratos } from './seeds/contratos.seed';
import { seedLecturas } from './seeds/lecturas.seed';
import { seedCatalogoDescuento } from './seeds/catalogoDescuento.seed';
import { seedFacturacion } from './seeds/facturacion.seed';
import { seedSriCatalogs } from './seeds/sri.seed';
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
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
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
  console.log('✅ Roles y Permisos asignados correctamente.')

  // Usuarios
  await seedUSers(prisma, roles);
  console.log('✅ Usuarios creados correctamente.');

  // Menus
  const menus = await seedMenus(prisma);
  console.log('✅ Menus creados correctamente.');

  // Menus-Permisos
  await seedMenuPermissions(prisma, menus, permissions);
  console.log('✅ Permisos asignados a Menus correctamente.');

  // SRI Catalogs
  console.log('🏛️ Cargando catálogos SRI...');
  await seedSriCatalogs(prisma);
  console.log('✅ Catálogos SRI cargados.');

  // === SEEDS DE LÓGICA DE NEGOCIO ===
  console.log('🏗️ Cargando datos de lógica de negocio...');
  await seedComunidades(prisma);
  console.log('✅ Comunidades creadas.');

  await seedSectores(prisma);
  console.log('✅ Sectores creados.');

  await seedCategoriaTarifa(prisma);
  console.log('✅ Categorías de tarifa creadas.');

  await seedClientes(prisma);
  console.log('✅ Clientes creados.');

  await seedContratos(prisma);
  console.log('✅ Contratos creados.');

  await seedLecturas(prisma);
  console.log('✅ Lecturas creadas.');

  // === DATOS PARA PROBAR SP DE FACTURACIÓN ===
  console.log('📦 Creando datos de facturación...');

  // Catálogo de Descuentos
  await seedCatalogoDescuento(prisma);
  console.log('✅ Catálogo de descuentos creado.');

  // Rubros
  await prisma.rubros.createMany({
    data: [
      { codigoSri: '001', nombre: 'Consumo Agua', descripcion: 'Consumo de agua potable m3', precioUnitario: 0.50, tipoRubro: 'VARIABLE' as any, impuestoId: 2 },
      { codigoSri: '002', nombre: 'Cargo Fijo', descripcion: 'Mantenimiento básico de conexión', precioUnitario: 5.00, tipoRubro: 'FIJO' as any, impuestoId: 2 },
      { codigoSri: '003', nombre: 'Interés Mora', descripcion: 'Interés por falta de pago puntual', precioUnitario: 0.10, tipoRubro: 'MULTA' as any, impuestoId: 1 },
      { codigoSri: '004', nombre: 'Tasa Seguridad Olón', descripcion: 'Tasa de seguridad comunitaria (Solo Olón)', precioUnitario: 2.00, tipoRubro: 'FIJO' as any, impuestoId: 1 },
      { codigoSri: '005', nombre: 'Instalación Medidor', descripcion: 'Costo de nueva acometida e instalación', precioUnitario: 150.00, tipoRubro: 'SERVICIO' as any, impuestoId: 2 },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Rubros creados');

  // === FACTURACIÓN ===
  await seedFacturacion(prisma);
  console.log('✅ Datos de facturación creados.');

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
    await prisma.$disconnect();
  });

