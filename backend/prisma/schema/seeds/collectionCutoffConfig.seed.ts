import type { PrismaClient } from '../../../src/generated/prisma/client';

// Keep the seed self-contained: the production image includes generated
// Prisma artifacts but not the complete `src` tree used by the application.
const COBRANZA_DIA_CORTE_MENSUAL = 'cobranza.dia_corte_mensual';
const COBRANZA_MESES_PARA_MORA = 'cobranza.meses_para_mora';
const COBRANZA_MESES_PARA_CORTE = 'cobranza.meses_para_corte';

const CONFIGS = [
  [
    COBRANZA_DIA_CORTE_MENSUAL,
    '15',
    'Día mensual de evaluación de cobranza (1-31)',
  ],
  [COBRANZA_MESES_PARA_MORA, '3', 'Períodos de servicio vencidos para EN_MORA'],
  [
    COBRANZA_MESES_PARA_CORTE,
    '5',
    'Períodos de servicio vencidos para elegibilidad de corte',
  ],
] as const;

export async function seedCollectionCutoffConfig(
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
