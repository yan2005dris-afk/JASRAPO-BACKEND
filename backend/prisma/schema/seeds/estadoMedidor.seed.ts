import { PrismaClient } from "src/generated/prisma/client";

export async function seedEstadoMedidor(prisma: PrismaClient) {
  const now = new Date();
  const estados = [
    { estadoId: 1, codigo: "BODEGA", nombre: "En Bodega", orden: 1, activo: true, creadoEn: now, actualizadoEn: now },
    { estadoId: 2, codigo: "INSTALADO", nombre: "Instalado", orden: 2, activo: true, creadoEn: now, actualizadoEn: now },
    { estadoId: 3, codigo: "DANADO", nombre: "Dañado", orden: 3, activo: true, creadoEn: now, actualizadoEn: now },
    { estadoId: 4, codigo: "PENDIENTE", nombre: "Pendiente", orden: 4, activo: true, creadoEn: now, actualizadoEn: now },
    { estadoId: 5, codigo: "BAJA", nombre: "Dado de Baja", orden: 5, activo: true, creadoEn: now, actualizadoEn: now },
  ];

  for (const e of estados) {
    await prisma.estadoMedidor.upsert({
      where: { estadoId: e.estadoId },
      update: {},
      create: e,
    });
  }

  console.log(`✅ ${estados.length} estados de medidor creados.`);
  return estados;
}