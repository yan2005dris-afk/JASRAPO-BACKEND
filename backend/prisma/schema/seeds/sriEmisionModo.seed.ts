import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });
import { Pool } from 'pg';
import { PrismaClient } from '../../../src/generated/prisma/client';
import { SRI_EMISION_MODO } from '../../../src/infrastructure/config/sistema-config.keys';

/**
 * Seed idempotente: instala el row de `sistema_config` consumido por
 * `SriEmisionModeService`.
 *
 * Decisión (sdd/sri-emision-modo-manual-automatico):
 *   - Default `valor = 'automatico'` (comportamiento actual; cero blast radius).
 *   - Patrón `findUnique → create` idéntico al de `reportesConfig.seed.ts`:
 *     re-runnable, sobrevive el `TRUNCATE` que hace `seed.ts` principal.
 *   - No `upsert`: respetar ediciones del operador. Si el row existe con un
 *     valor distinto, logueamos y dejamos el row intacto.
 *
 * Uso:
 *   pnpm --filter backend exec tsx prisma/schema/seeds/sriEmisionModo.seed.ts
 */

const DEFAULT_VALOR = 'automatico';
const DESCRIPCION =
  'Modo de emisión SRI: automatico (envío inmediato) | manual (parqueado en POR_EMITIR)';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(
      `🌱 Seeding sistema_config[${SRI_EMISION_MODO}] (default=${DEFAULT_VALOR})...`,
    );

    const existing = await prisma.sistemaConfig.findUnique({
      where: { clave: SRI_EMISION_MODO },
    });

    if (existing) {
      console.log(
        `  ⏭️  ${SRI_EMISION_MODO}: existing valor="${existing.valor}" — preserved`,
      );
    } else {
      await prisma.sistemaConfig.create({
        data: {
          clave: SRI_EMISION_MODO,
          valor: DEFAULT_VALOR,
          descripcion: DESCRIPCION,
        },
      });
      console.log(`  ✅ ${SRI_EMISION_MODO}: created with "${DEFAULT_VALOR}"`);
    }

    const finalRow = await prisma.sistemaConfig.findUnique({
      where: { clave: SRI_EMISION_MODO },
    });
    console.log(
      `\n✅ Seed completado. ${SRI_EMISION_MODO} = "${finalRow?.valor}"`,
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
