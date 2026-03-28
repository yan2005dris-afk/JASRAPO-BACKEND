import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../../src/generated/prisma/client';
import { seedMenus } from './seeds/menu.seed';
import { seedMenuPermissions } from './seeds/menuPermission.seed';
import { seedPermissions } from './seeds/permission.seed';
import { seedRoles } from './seeds/role.seed';
import { seedRolePermissions } from './seeds/rolePermission.seed';
import { seedRoleHierarchy } from './seeds/roleHierarchy.seed';
import { seedUSers } from './seeds/user.seed';
import { seedComunidades } from './seeds/comunidades.seed';
import { seedSectores } from './seeds/sectores.seed';
import { seedCategoriaTarifa } from './seeds/categoriaTarifa.seed';
import { seedClientes } from './seeds/clientes.seed';
import { seedContratos } from './seeds/contratos.seed';
import { seedLecturas } from './seeds/lecturas.seed';

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

  // Jerarquia de roles
  await seedRoleHierarchy(prisma, roles);
  console.log('✅ Jerarquia de Roles creada correctamente.');

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

  // === DATOS PARA PROBAR SP DE FACTURACIÓN ===
  console.log('📦 Creando datos de facturación...');

  // Rubros
  await prisma.rubros.createMany({
    data: [
      { codigoSri: '001', descripcion: 'Consumo Agua', valorUnitario: 0.50, tipoRubro: 'VARIABLE', gravaIva: true },
      { codigoSri: '002', descripcion: 'Cargo Fijo', valorUnitario: 5.00, tipoRubro: 'FIJO', gravaIva: true },
      { codigoSri: '003', descripcion: 'Interés Mora', valorUnitario: 0.10, tipoRubro: 'MULTA', gravaIva: false },
      { codigoSri: '004', descripcion: 'Tasa Seguridad', valorUnitario: 0, tipoRubro: 'VARIABLE', gravaIva: false },
    ],
    skipDuplicates: true,
  });
  console.log('✅ Rubros creados');

  // Comunidades
  await seedComunidades(prisma);
  console.log('✅ Comunidades creadas');

  // Sectores
  await seedSectores(prisma);
  console.log('✅ Sectores creados');

  // Categorías Tarifa
  await seedCategoriaTarifa(prisma);
  console.log('✅ Categorías de tarifa creadas');

  // Clientes
  await seedClientes(prisma);
  console.log('✅ Clientes creados');

  // Contratos
  await seedContratos(prisma);
  console.log('✅ Contratos creados');

  // Lecturas (12 meses)
  await seedLecturas(prisma);
  console.log('✅ Lecturas creadas (12 meses)');

  console.log('✅ Seed de facturación completado.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
