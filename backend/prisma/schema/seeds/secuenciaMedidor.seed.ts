import type { PrismaClient } from 'src/generated/prisma/client';

export interface NextMeterCodeResult {
  codigo: string;
  correlativo: number;
}

/**
 * Genera el siguiente código correlativo de medidor asegurando el bloqueo
 * y la actualización coherente de la tabla `secuencia_medidor`.
 */
export async function takeNextMeterCodeSeed(
  prisma: PrismaClient,
): Promise<NextMeterCodeResult> {
  const [config] = await prisma.$queryRaw<
    { secuencia_medidor_id: number; prefijo: string; longitud: number }[]
  >`
    SELECT "secuencia_medidor_id", "prefijo", "longitud"
    FROM "secuencia_medidor"
    ORDER BY "secuencia_medidor_id"
    LIMIT 1
    FOR UPDATE
  `;

  if (!config) {
    // Si no existe, inicializar la fila base
    await prisma.secuenciaMedidor.create({
      data: {
        prefijo: 'MED',
        longitud: 6,
        ultimoValor: 0,
      },
    });
    return takeNextMeterCodeSeed(prisma);
  }

  const updated = await prisma.secuenciaMedidor.update({
    where: { secuenciaMedidorId: config.secuencia_medidor_id },
    data: { ultimoValor: { increment: 1 } },
    select: { ultimoValor: true },
  });

  const correlativo = updated.ultimoValor;
  const codigo = `${config.prefijo}-${String(correlativo).padStart(config.longitud, '0')}`;
  return { codigo, correlativo };
}

/**
 * Siembra o asegura la existencia de la configuración de secuencia de medidor.
 */
export async function seedSecuenciaMedidor(prisma: PrismaClient) {
  const existing = await prisma.secuenciaMedidor.findFirst({
    orderBy: { secuenciaMedidorId: 'asc' },
  });

  if (!existing) {
    await prisma.secuenciaMedidor.create({
      data: {
        prefijo: 'MED',
        longitud: 6,
        ultimoValor: 0,
      },
    });
    console.log('✅ Secuencia de medidores inicializada.');
  }
}
