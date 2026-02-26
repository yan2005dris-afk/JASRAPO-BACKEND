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
