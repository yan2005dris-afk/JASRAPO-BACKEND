import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedPeriodos(prisma: PrismaClient) {
  const openPeriod = await prisma.periodos.upsert({
    where: { nombre: 'Enero 2026' },
    update: {},
    create: {
      nombre: 'Enero 2026',
      fechaInicio: new Date('2026-01-01T00:00:00.000Z'),
      fechaFin: new Date('2026-01-31T23:59:59.999Z'),
      fechaVencimiento: new Date('2026-02-15T23:59:59.999Z'),
      estado: 'ABIERTO',
    },
  });
  console.log(`✅ Período activo "${openPeriod.nombre}" creado.`);
  return [openPeriod];
}

