import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedIdentificacion(prisma: PrismaClient) {
  const identificaciones = [
    {
      identificacionId: 1,
      codigo: 'CEDULA',
      nombre: 'Cédula de Identidad',
      orden: 1,
    },
    { identificacionId: 2, codigo: 'RUC', nombre: 'RUC', orden: 2 },
    { identificacionId: 3, codigo: 'PASAPORTE', nombre: 'Pasaporte', orden: 3 },
    {
      identificacionId: 4,
      codigo: 'CONSUMIDOR_FINAL',
      nombre: 'Consumidor Final',
      orden: 4,
    },
    {
      identificacionId: 5,
      codigo: 'IDENTIFICACION_EXTRANJERA',
      nombre: 'Identificación Extranjera',
      orden: 5,
    },
  ];

  for (const i of identificaciones) {
    await prisma.identificacion.upsert({
      where: { identificacionId: i.identificacionId },
      update: {},
      create: i,
    });
  }

  console.log(`✅ ${identificaciones.length} tipos de identificación creados.`);
  return identificaciones;
}
