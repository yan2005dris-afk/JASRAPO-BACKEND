import type { PrismaClient } from '../../../src/generated/prisma/client';
import {
  COBRANZA_DIA_CORTE_MENSUAL,
  COBRANZA_MESES_PARA_CORTE,
  COBRANZA_MESES_PARA_MORA,
} from '../../../src/infrastructure/config/sistema-config.keys';

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
