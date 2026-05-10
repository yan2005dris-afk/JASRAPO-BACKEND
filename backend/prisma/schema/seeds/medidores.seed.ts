import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedMedidores(prisma: PrismaClient) {
  const now = new Date();
  const medidores = [
    {
      medidorId: 1,
      contratoId: null,
      marca: 'Itron',
      modelo: 'CEntra 500',
      serie: 'SER001',
      fechaInstalacion: null,
      latitud: -0.2281,
      longitud: -78.0023,
      estadoId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 2,
      contratoId: null,
      marca: 'Itron',
      modelo: 'CEntra 500',
      serie: 'SER002',
      fechaInstalacion: null,
      latitud: -0.2282,
      longitud: -78.0024,
      estadoId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 3,
      contratoId: null,
      marca: 'Itron',
      modelo: 'CEntra 500',
      serie: 'SER003',
      fechaInstalacion: null,
      latitud: -0.2283,
      longitud: -78.0025,
      estadoId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 4,
      contratoId: null,
      marca: 'Sensus',
      modelo: 'iPerl',
      serie: 'SEN001',
      fechaInstalacion: null,
      latitud: -0.2284,
      longitud: -78.0026,
      estadoId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 5,
      contratoId: null,
      marca: 'Sensus',
      modelo: 'iPerl',
      serie: 'SEN002',
      fechaInstalacion: null,
      latitud: -0.2285,
      longitud: -78.0027,
      estadoId: 1,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  for (const m of medidores) {
    await prisma.medidores.upsert({
      where: { medidorId: m.medidorId },
      update: {},
      create: m,
    });
  }

  console.log(`✅ ${medidores.length} medidores creados.`);
  return medidores;
}
