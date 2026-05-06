import { PrismaClient } from "@generated/prisma/client";


export async function seedEstadoLote(prisma: PrismaClient) {
  const now = new Date();
  const estados = [
    { estadoId: 1, codigo: 'BORRADOR', nombre: 'Borrador', orden: 1, activo: true, createdAt: now, updatedAt: now, deletedAt: null },
    { estadoId: 2, codigo: 'DEFINITIVO', nombre: 'Definitivo', orden: 2, activo: true, createdAt: now, updatedAt: now, deletedAt: null },
    { estadoId: 3, codigo: 'ENVIADO', nombre: 'Enviado', orden: 3, activo: true, createdAt: now, updatedAt: now, deletedAt: null },
  ];

  for (const e of estados) {
    await prisma.estadoLote.upsert({
      where: { estadoId: e.estadoId },
      update: {},
      create: e,
    });
  }

  console.log(`✅ ${estados.length} estados de lote creados.`);
  return estados;
}