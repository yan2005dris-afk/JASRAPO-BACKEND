import { PrismaClient } from '../../../src/generated/prisma/client';

export async function seedComunidades(prisma: PrismaClient) {
  const comunidades = [
    { nombre: 'olon' },
    { nombre: 'nuñez' },
    { nombre: 'la entrada' },
    { nombre: 'uria' },
    { nombre: 'san jose' },
  ];
  for (const comunidad of comunidades) {
    await prisma.comunidades.upsert({
      where: { comunidadId: BigInt(comunidades.indexOf(comunidad) + 1) }, // upsert requiere un campo único, usamos comunidadId
      update: {},
      create: comunidad,
    });
  }
}
