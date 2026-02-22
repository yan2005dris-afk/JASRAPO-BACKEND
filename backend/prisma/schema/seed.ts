import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import {
  PrismaClient,
  Permissions,
  Roles,
} from '../../src/generated/prisma/client';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Seeding database...');

  const adminRol = await prisma.roles.upsert({
    where: { rolesId: 1 },
    update: {},
    create: { rolesId: 1, name: 'admin' },
  });

  const secretariaRol = await prisma.roles.upsert({
    where: { rolesId: 2 },
    update: {},
    create: { rolesId: 2, name: 'secretaria' },
  });

  const userRol = await prisma.roles.upsert({
    where: { rolesId: 3 },
    update: {},
    create: { rolesId: 3, name: 'user' },
  });

  const permissionsToCreate = [
    { resource: 'users', action: 'create' },
    { resource: 'users', action: 'read' },
    { resource: 'users', action: 'update' },
    { resource: 'users', action: 'delete' },
  ];

  const savedPermissions: Permissions[] = [];

  for (const p of permissionsToCreate) {
    let perm = await prisma.permissions.findFirst({
      where: { resource: p.resource, action: p.action },
    });

    if (!perm) {
      perm = await prisma.permissions.create({
        data: {
          resource: p.resource,
          action: p.action,
        },
      });
    }
    savedPermissions.push(perm);
  }

  await prisma.rolPermissions.deleteMany({});

  // Asignar TODOS los permisos al Admin
  for (const perm of savedPermissions) {
    await prisma.rolPermissions.create({
      data: {
        rolesId: adminRol.rolesId,
        permissionsId: perm.permissionsId,
      },
    });
  }

  const readPerm = savedPermissions.find(
    (p) => p.resource === 'users' && p.action === 'read',
  );
  if (readPerm) {
    await prisma.rolPermissions.create({
      data: {
        rolesId: userRol.rolesId,
        permissionsId: readPerm.permissionsId,
      },
    });
  }

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
