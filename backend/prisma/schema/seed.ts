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
import { seedUserRoles } from './seeds/userRoles.seed';

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
    // Obtener todas las tablas de la base de datos pública
    const tablenames = await prisma.$queryRaw<
      Array<{ tablename: string }>
    >`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

    // Filtrar migraciones y formatear la lista de tablas
    const tables = tablenames
      .map(({ tablename }) => tablename)
      .filter((name) => name !== '_prisma_migrations')
      .map((name) => `"public"."${name}"`)
      .join(', ');

    // Truncar todas con RESTART IDENTITY y CASCADE para evitar problemas de dependencias y resetear secuencias (IDs a 1)
    if (tables.length > 0) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
    }
    console.log('✅ Base de datos limpiada correctamente desde 0.');
  } catch (error) {
    console.error('❌ Error limpiando base de datos', error);
  }

  //Roles
  const roles = await seedRoles(prisma);
  console.log('✅ Roles creados correctamente.');

  //Permisos
  const permissions = await seedPermissions(prisma);
  console.log('✅ Permisos creados correctamente.');

  //Roles-Permisos
  await seedRolePermissions(prisma, roles, permissions);
  console.log('✅ Roles y Permisos asignados correctamente.')

  //Usuarios
  const users = await seedUSers(prisma);
  console.log('✅ Usuarios creados correctamente.');

  //Usuarios-Roles
  await seedUserRoles(prisma, users, roles);
  console.log('✅ Roles asignados a Usuarios correctamente.');

  ;

  //Menus
  const menus = await seedMenus(prisma);
  console.log('✅ Menus creados correctamente.');

  //Menus-Permisos
  await seedMenuPermissions(prisma, menus, permissions);
  console.log('✅ Permisos asignados a Menus correctamente.');


  console.log('✅ Seed finalizado: Roles y Permisos creados correctamente.');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
