import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });
import { Pool } from 'pg';
import { PrismaClient } from '../../../src/generated/prisma/client';

/**
 * Seed idempotente para los 4 keys de `sistema_config` consumidos por el
 * ReportStyleDispatcher.
 *
 * Contexto histórico:
 *   Estos 4 INSERTs vivían en la migration
 *   `20260702120000_seed_sistema_config_reportes`. La migración se aplicaba
 *   una sola vez, pero el seed principal (`seed.ts`) hace TRUNCATE de
 *   todas las tablas excepto `_prisma_migrations`. Resultado: Prisma
 *   creía que la migración estaba aplicada, pero la tabla quedaba vacía.
 *
 *   Este seed es la solución correcta: data configurable pertenece a un
 *   seed (re-ejecutable e idempotente), no a una migración.
 *
 * Uso:
 *   pnpm --filter backend exec tsx prisma/schema/seeds/reportesConfig.seed.ts
 *
 * Idempotente: usa upsert sobre `clave` (PK única), así que re-correrlo
 * actualiza los rows existentes y crea los faltantes sin duplicar.
 */

const CONFIG_KEYS: Array<{
  clave: string;
  valor: string;
  descripcion: string;
}> = [
  {
    clave: 'reporte.estilo.default',
    valor: 'modern',
    descripcion: 'Estilo por defecto para todos los reportes (legacy|modern)',
  },
  {
    clave: 'reporte.estilo.payments-report',
    valor: 'modern',
    descripcion: 'Estilo del reporte "Reporte de Pagos" (legacy|modern)',
  },
  {
    clave: 'reporte.estilo.connection-history',
    valor: 'modern',
    descripcion: 'Estilo del reporte "Historial de Conexiones" (legacy|modern)',
  },
  {
    clave: 'reporte.estilo.payment-agreement',
    valor: 'modern',
    descripcion: 'Estilo del reporte "Convenio de Pago" (legacy|modern)',
  },
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log('🌱 Seeding sistema_config report styles...');

    for (const cfg of CONFIG_KEYS) {
      const existing = await prisma.sistemaConfig.findUnique({
        where: { clave: cfg.clave },
      });

      if (existing) {
        // Preserve operator edits: only update if the value differs from the
        // documented default, otherwise leave it alone.
        if (existing.valor !== cfg.valor) {
          await prisma.sistemaConfig.update({
            where: { clave: cfg.clave },
            data: { valor: cfg.valor, descripcion: cfg.descripcion },
          });
          console.log(`  ✏️  ${cfg.clave}: updated to "${cfg.valor}"`);
        } else {
          console.log(`  ⏭️  ${cfg.clave}: already at "${cfg.valor}"`);
        }
      } else {
        await prisma.sistemaConfig.create({
          data: cfg,
        });
        console.log(`  ✅ ${cfg.clave}: created with "${cfg.valor}"`);
      }
    }

    const finalCount = await prisma.sistemaConfig.count({
      where: { clave: { startsWith: 'reporte.estilo.' } },
    });
    console.log(
      `\n✅ Seed completado. ${finalCount} keys de reporte.estilo.* en sistema_config.`,
    );
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main();