import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedSectores(prisma: PrismaClient) {
  const sectores = [
    // Olon (comunidad 1)
    {
      sectorId: 1,
      comunidadId: 1,
      codigo: 'SEC-OLON-NORTE',
      nombre: 'Sector Norte Olón',
    },
    {
      sectorId: 2,
      comunidadId: 1,
      codigo: 'SEC-OLON-SUR',
      nombre: 'Sector Sur Olón',
    },
    {
      sectorId: 3,
      comunidadId: 1,
      codigo: 'SEC-OLON-CENTRO',
      nombre: 'Sector Centro Olón',
    },
    {
      sectorId: 4,
      comunidadId: 1,
      codigo: 'SEC-OLON-PLAYA',
      nombre: 'Sector Playa Olón',
    },
    // Nuñez (comunidad 2)
    {
      sectorId: 5,
      comunidadId: 2,
      codigo: 'SEC-NUNEZ-CENTRO',
      nombre: 'Sector Centro Nuñez',
    },
    {
      sectorId: 6,
      comunidadId: 2,
      codigo: 'SEC-NUNEZ-ALTO',
      nombre: 'Sector Nuñez Alto',
    },
    // La Entrada (comunidad 3)
    {
      sectorId: 7,
      comunidadId: 3,
      codigo: 'SEC-ENTRADA-NORTE',
      nombre: 'Sector La Entrada Norte',
    },
    {
      sectorId: 8,
      comunidadId: 3,
      codigo: 'SEC-ENTRADA-SUR',
      nombre: 'Sector La Entrada Sur',
    },
    // San Jose (comunidad 4)
    {
      sectorId: 9,
      comunidadId: 4,
      codigo: 'SEC-SANJOSE-PLAYA',
      nombre: 'Sector Playa San José',
    },
    {
      sectorId: 10,
      comunidadId: 4,
      codigo: 'SEC-SANJOSE-CENTRO',
      nombre: 'Sector Centro San José',
    },
    // Curia (comunidad 5)
    {
      sectorId: 11,
      comunidadId: 5,
      codigo: 'SEC-CURIA-CENTRO',
      nombre: 'Sector Centro Curia',
    },
    {
      sectorId: 12,
      comunidadId: 5,
      codigo: 'SEC-CURIA-MIRADOR',
      nombre: 'Sector Mirador Curia',
    },
  ];

  const result: Awaited<ReturnType<typeof prisma.sectores.findUnique>>[] = [];
  for (const s of sectores) {
    const created = await prisma.sectores.upsert({
      where: { sectorId: s.sectorId },
      update: {},
      create: s,
    });
    result.push(created);
  }

  return result;
}
