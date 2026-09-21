import { PrismaClient, EstadoMedidor } from 'src/generated/prisma/client';
import { takeNextMeterCodeSeed } from './secuenciaMedidor.seed';

export async function seedMedidores(prisma: PrismaClient) {
  const now = new Date();
  const medidoresBase = [
    {
      medidorId: 1,
      marca: 'Itron',
      modelo: 'CEntra 500',
      serie: 'SER001',
      fechaInstalacion: null,
      latitud: -1.7966,
      longitud: -80.7568,
      estado: 'BODEGA' as EstadoMedidor,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 2,
      marca: 'Itron',
      modelo: 'CEntra 500',
      serie: 'SER002',
      fechaInstalacion: null,
      latitud: -1.7968,
      longitud: -80.757,
      estado: 'BODEGA' as EstadoMedidor,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 3,
      marca: 'Itron',
      modelo: 'CEntra 500',
      serie: 'SER003',
      fechaInstalacion: null,
      latitud: -1.797,
      longitud: -80.7572,
      estado: 'BODEGA' as EstadoMedidor,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 4,
      marca: 'Sensus',
      modelo: 'iPerl',
      serie: 'SEN001',
      fechaInstalacion: null,
      latitud: -1.7972,
      longitud: -80.7574,
      estado: 'BODEGA' as EstadoMedidor,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
    {
      medidorId: 5,
      marca: 'Sensus',
      modelo: 'iPerl',
      serie: 'SEN002',
      fechaInstalacion: null,
      latitud: -1.7974,
      longitud: -80.7576,
      estado: 'BODEGA' as EstadoMedidor,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
    },
  ];

  const createdMedidores: any[] = [];

  for (const m of medidoresBase) {
    const { codigo } = await takeNextMeterCodeSeed(prisma);

    const record = await prisma.medidores.upsert({
      where: { medidorId: m.medidorId },
      update: {
        latitud: m.latitud,
        longitud: m.longitud,
        marca: m.marca,
        modelo: m.modelo,
        serie: m.serie,
        estado: m.estado,
        codigo,
        updatedAt: now,
      },
      create: {
        ...m,
        codigo,
      },
    });
    createdMedidores.push(record);
  }

  console.log(`✅ ${createdMedidores.length} medidores creados con código secuencial.`);
  return createdMedidores;
}