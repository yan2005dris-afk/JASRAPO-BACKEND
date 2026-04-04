import { PrismaClient } from "src/generated/prisma/client";

export async function seedCategoriaTarifa(prisma: PrismaClient) {
    const categorias = [
    {
      categoriaTarifaId: 1,
      nombre: "Tipo 1",
      descripcion: "Tarifa tipo 1",
      valorBase: 4.0,
      valorExcedenteM3: 0.4,
      activo: true,
      consumoMinimoMensual: 0, // opcional, evita null
    },
    {
      categoriaTarifaId: 2,
      nombre: "Tipo 2",
      descripcion: "Tarifa tipo 2",
      valorBase: 7.5,
      valorExcedenteM3: 0.75,
      activo: true,
      consumoMinimoMensual: 0,
    },
    {
      categoriaTarifaId: 3,
      nombre: "Tipo 3",
      descripcion: "Tarifa tipo 3",
      valorBase: 15.0,
      valorExcedenteM3: 1.5,
      activo: true,
      consumoMinimoMensual: 0,
    },
  ];

  const result: Awaited<ReturnType<typeof prisma.categoriaTarifa.findUnique>>[] = [];
  for (const c of categorias) {
    const created = await prisma.categoriaTarifa.upsert({
      where: { categoriaTarifaId: c.categoriaTarifaId },
      update: {}, // no update para este seed
      create: {
        nombre: c.nombre,
        descripcion: c.descripcion,
        valorBase: c.valorBase,
        consumoMinimoMensual: c.consumoMinimoMensual,
        valorExcedenteM3: c.valorExcedenteM3,
        activo: c.activo,
      },
    });
    result.push(created);
  }

  return result;
}
