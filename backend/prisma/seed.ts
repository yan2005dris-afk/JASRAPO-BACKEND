import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'error', 'warn'],
});

async function main() {
  console.log('🌱 Seeding database...');

  const usersCount = await prisma.user.count();

  if (usersCount > 0) {
    console.log('⚠️ Database already seeded. Skipping...');
    return;
  }

  await prisma.user.create({
    data: {
      userEmail: 'admin@test.com',
      userName: 'Admin',
      userPassword: '123456',
    },
  });

  console.log('✅ Seed completed');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
