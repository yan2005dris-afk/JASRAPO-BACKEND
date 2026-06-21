import { PrismaClient, EstadoMedidor } from "src/generated/prisma/client";

export async function seedMedidores(prisma: PrismaClient) {
  const now = new Date();
  const medidores = [
    { medidorId: 1, marca: "Itron", modelo: "CEntra 500", serie: "SER001", fechaInstalacion: null, latitud: -1.7966, longitud: -80.7568, estado: "BODEGA" as EstadoMedidor, createdAt: now, updatedAt: now, deletedAt: null },
    { medidorId: 2, marca: "Itron", modelo: "CEntra 500", serie: "SER002", fechaInstalacion: null, latitud: -1.7968, longitud: -80.7570, estado: "BODEGA" as EstadoMedidor, createdAt: now, updatedAt: now, deletedAt: null },
    { medidorId: 3, marca: "Itron", modelo: "CEntra 500", serie: "SER003", fechaInstalacion: null, latitud: -1.7970, longitud: -80.7572, estado: "BODEGA" as EstadoMedidor, createdAt: now, updatedAt: now, deletedAt: null },
    { medidorId: 4, marca: "Sensus", modelo: "iPerl", serie: "SEN001", fechaInstalacion: null, latitud: -1.7972, longitud: -80.7574, estado: "BODEGA" as EstadoMedidor, createdAt: now, updatedAt: now, deletedAt: null },
    { medidorId: 5, marca: "Sensus", modelo: "iPerl", serie: "SEN002", fechaInstalacion: null, latitud: -1.7974, longitud: -80.7576, estado: "BODEGA" as EstadoMedidor, createdAt: now, updatedAt: now, deletedAt: null },
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