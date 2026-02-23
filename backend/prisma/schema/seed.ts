import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';
import { Pool } from 'pg';
import { PrismaClient } from '../../src/generated/prisma/client';
import { seedPermissions } from './seeds/permission.seed';
import { seedRoles } from './seeds/role.seed';
import { seedRolePermissions } from './seeds/rolePermission.seed';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Seeding database...');

  const roles = await seedRoles(prisma);
  const permissions = await seedPermissions(prisma);
  await seedRolePermissions(prisma, roles, permissions);

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
