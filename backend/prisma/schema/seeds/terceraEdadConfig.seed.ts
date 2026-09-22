import type { PrismaClient } from '../../../src/generated/prisma/client';

// Seed self-contenido: la imagen de producción incluye los artefactos
// generados de Prisma pero no todo el árbol `src`, por eso la clave se
// declara aquí en lugar de importarla desde sistema-config.keys.
const CLIENTES_TERCERA_EDAD_EDAD_MINIMA = 'clientes.tercera-edad.edad-minima';

const CONFIGS = [
  [
    CLIENTES_TERCERA_EDAD_EDAD_MINIMA,
    '65',
    'Edad mínima (años) para aplicar el beneficio de tercera edad',
  ],
] as const;

/**
 * Seed idempotente del row de `sistema_config` consumido por
 * `TerceraEdadService`. Patrón `findUnique → create`: re-runnable y respeta
 * ediciones del operador (si el row existe, no lo toca).
 */
export async function seedTerceraEdadConfig(
  prisma: PrismaClient,
): Promise<void> {
  for (const [clave, valor, descripcion] of CONFIGS) {
    const existing = await prisma.sistemaConfig.findUnique({
      where: { clave },
    });
    if (!existing) {
      await prisma.sistemaConfig.create({
        data: { clave, valor, descripcion },
      });
    }
  }
}
