import type { PrismaClient } from 'src/generated/prisma/client';

/** Ensures the migrated counter row exists for contract guide generation. */
export async function seedSecuenciaContrato(prisma: PrismaClient) {
  const existing = await prisma.secuenciaContrato.findFirst({
    orderBy: { secuenciaContratoId: 'asc' },
  });

  if (!existing) {
    await prisma.secuenciaContrato.create({
      data: {
        longitud: 5,
        ultimoValor: 0n,
      },
    });
    console.log('✅ Secuencia de guías de contratos inicializada.');
  }
}
