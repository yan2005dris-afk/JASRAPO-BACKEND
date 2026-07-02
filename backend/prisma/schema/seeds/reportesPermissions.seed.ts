import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'node:path';
dotenv.config({ path: path.resolve(__dirname, '../../../..', '.env') });
import { Pool } from 'pg';
import { PrismaClient } from '../../../src/generated/prisma/client';

/**
 * Seed idempotente para registrar el recurso `reportes` y asignarlo a los
 * roles que lo necesitan.
 *
 * Contexto:
 *   El módulo `src/reports/interfaces/http/reports.controller.ts` protege
 *   todos sus endpoints con `@RequiredPermission('reportes', 'read')`,
 *   pero el seed histórico (`permission.seed.ts`) nunca creó ese recurso
 *   (sólo `estado_cuenta`, `recaudacion_morosidad`, `consumo_zonas`,
 *   `dashboard`). Resultado: 403 garantizado para cualquier report.
 *
 * Uso:
 *   pnpm --filter backend exec tsx prisma/schema/seeds/reportesPermissions.seed.ts
 *
 * Idempotente: se puede correr varias veces sin duplicar.
 */
const RESOURCE = 'reportes';

const PERMISSION_DEFS: Array<{
  accion: 'read' | 'create' | 'update' | 'delete';
  nombre: string;
  descripcion: string;
}> = [
  {
    accion: 'read',
    nombre: 'Consultar Reportes',
    descripcion: 'Permite consultar y descargar los reportes del sistema (PDF)',
  },
  {
    accion: 'create',
    nombre: 'Generar Reportes',
    descripcion: 'Permite crear/generar nuevos reportes',
  },
  {
    accion: 'update',
    nombre: 'Modificar Reportes',
    descripcion: 'Permite modificar la configuración de reportes',
  },
  {
    accion: 'delete',
    nombre: 'Eliminar Reportes',
    descripcion: 'Permite eliminar reportes',
  },
];

const ROLES_CON_READ = [
  'superadmin',
  'admin',
  'presidencia',
  'secretaria',
  'recaudacion',
  'contabilidad',
];

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`🌱 Seeding permisos para recurso "${RESOURCE}"...`);

    // 1) Upsert de los 4 permisos del recurso `reportes`
    const permisosByAccion: Record<string, number> = {};
    for (const def of PERMISSION_DEFS) {
      const existing = await prisma.permisos.findFirst({
        where: { recurso: RESOURCE, accion: def.accion },
      });
      const perm =
        existing ??
        (await prisma.permisos.create({
          data: {
            nombre: def.nombre,
            descripcion: def.descripcion,
            recurso: RESOURCE,
            accion: def.accion,
          },
        }));
      permisosByAccion[def.accion] = perm.permisoId;
      console.log(
        `  ✅ ${RESOURCE}:${def.accion} → permisoId=${perm.permisoId}`,
      );
    }

    // 2) Asignar `reportes:read` a los roles relevantes
    console.log('\n👥 Asignando reportes:read a roles...');
    for (const rolNombre of ROLES_CON_READ) {
      const rol = await prisma.roles.findFirst({
        where: { nombre: rolNombre },
      });
      if (!rol) {
        console.warn(`  ⚠️  Rol "${rolNombre}" no existe — saltando.`);
        continue;
      }
      const existing = await prisma.rolPermisos.findFirst({
        where: { rolId: rol.rolId, permisoId: permisosByAccion.read },
      });
      if (existing) {
        console.log(`  ⏭️  ${rolNombre}: ya tiene reportes:read`);
        continue;
      }
      await prisma.rolPermisos.create({
        data: { rolId: rol.rolId, permisoId: permisosByAccion.read },
      });
      console.log(`  ✅ ${rolNombre}: reportes:read asignado`);
    }

    console.log('\n✅ Seed de permisos de reportes completado.');
  } catch (error) {
    console.error('❌ Error en el seed:', error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

void main();