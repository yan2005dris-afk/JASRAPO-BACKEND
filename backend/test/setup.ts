import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

// Global references
let prisma: PrismaClient;
let isE2EMode = true;

// Configuration - use env vars or fallbacks
const getDbConfig = () => {
  // Try to use a dedicated test database url if provided
  const testDatabaseUrl =
    process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (testDatabaseUrl) {
    // Parse DATABASE_URL or use as-is
    return testDatabaseUrl;
  }

  // Fallback - construct from env
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = parseInt(process.env.POSTGRES_PORT || '5432', 10);
  const user = process.env.POSTGRES_USER || 'postgres';
  const password = process.env.POSTGRES_PASSWORD || 'postgres';
  const db = process.env.POSTGRES_DB || 'jasrapo_e2e';

  return `postgresql://${user}:${password}@${host}:${port}/${db}`;
};

interface TestDatabaseConfig {
  host: string;
  port: number;
  database: string;
  username: string;
  password: string;
}

let containerPort: number;

/**
 * Get the test database configuration
 */
export function getTestDatabaseConfig(): TestDatabaseConfig {
  const dbUrl = getDbConfig();
  const match = dbUrl.match(
    /postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/,
  );

  if (match) {
    return {
      username: match[1],
      password: match[2],
      host: match[3],
      port: parseInt(match[4], 10),
      database: match[5],
    };
  }

  // Fallback
  return {
    host: 'localhost',
    port: 5432,
    database: 'jasrapo_e2e',
    username: 'postgres',
    password: 'postgres',
  };
}

/**
 * Get PrismaClient connected to test database
 */
export function getPrismaClient(): PrismaClient {
  return prisma;
}

/**
 * Check if Docker is available
 */
export async function isDockerAvailable(): Promise<boolean> {
  try {
    const { execSync } = await import('child_process');
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Setup test database (without containers)
 * Connects directly to existing database
 */
export async function setupTestDatabase(): Promise<void> {
  console.log('🔧 Setting up E2E test environment...');

  const databaseUrl = getDbConfig();

  console.log(
    `📦 Connecting to database: ${databaseUrl.replace(/:[^@]+@/, ':***@')}`,
  );

  // Set for app
  process.env.DATABASE_URL = databaseUrl;

  // Wait for database to be ready with retry logic
  let retries = 5;
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaPg(pool);

  while (retries > 0) {
    try {
      prisma = new PrismaClient({ adapter });

      // Test connection
      await prisma.$connect();
      console.log('✅ Database connected');
      break;
    } catch (err) {
      retries--;
      if (retries === 0) {
        console.warn('⚠️ Database not available, using mock mode');
        isE2EMode = false;
        return;
      }
      console.log(`⏳ Retrying database connection... (${retries} left)`);
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  // Check if tables exist
  try {
    await prisma.$queryRaw`SELECT 1 FROM usuarios LIMIT 1`;
    console.log('✅ Database tables verified');
  } catch {
    console.log('📦 Running Prisma migrations...');
    const { execSync } = await import('child_process');
    execSync('npx prisma migrate deploy --skip-generate', {
      env: { ...process.env, DATABASE_URL: databaseUrl },
      stdio: 'inherit',
    });
  }

  // Seed minimal test data
  await seedTestData(prisma);

  console.log('✅ E2E test environment ready');
}

/**
 * Seed minimal test data
 */
async function seedTestData(prisma: PrismaClient): Promise<void> {
  try {
    console.log('🌱 Seeding test data...');

    // Check if role exists
    const existingRole = await prisma.roles.findFirst({
      where: { nombre: 'Administrador' },
    });

    if (!existingRole) {
      await prisma.roles.create({
        data: {
          nombre: 'Administrador',
        },
      });
    }

    // Check comunidad
    const existingComunidad = await prisma.comunidades.findFirst({
      where: { codigo: 'TC001' },
    });

    if (!existingComunidad) {
      await prisma.comunidades.create({
        data: {
          nombre: 'Test Comunidad',
          codigo: 'TC001',
          porcentajeTasaSeguridad: 0,
        },
      });
    }

    // Check tarifas
    const existingTarifa = await prisma.categoriaTarifa.findFirst({
      where: { nombre: 'Doméstica' },
    });

    if (!existingTarifa) {
      await prisma.categoriaTarifa.create({
        data: {
          nombre: 'Doméstica',
          activo: true,
          valorBase: 10.0,
        },
      });
    }

    console.log('✅ Test data seeded');
  } catch (err) {
    console.warn('⚠️ Could not seed data:', err);
  }
}

/**
 * Cleanup test data
 */
export async function cleanupTestDatabase(): Promise<void> {
  if (!prisma) return;

  console.log('🧹 Cleaning up test data...');

  const tables = [
    'historialMedidores',
    'lecturas',
    'contratos',
    'medidores',
    'usuarios',
    'roles',
  ];

  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany({});
    } catch {}
  }

  console.log('✅ Test data cleaned up');
}

/**
 * Teardown test database
 */
export async function teardownTestDatabase(): Promise<void> {
  console.log('🛑 Tearing down test database...');

  if (prisma) {
    await prisma.$disconnect();
    (prisma as any) = null;
  }

  console.log('✅ Test database teardown complete');
}

// Jest hooks
export async function beforeAllHook(): Promise<void> {
  await setupTestDatabase();
}

export async function afterAllHook(): Promise<void> {
  await teardownTestDatabase();
}

/**
 * Check if running in E2E mode (with real DB)
 */
export function isE2E(): boolean {
  return isE2EMode;
}
