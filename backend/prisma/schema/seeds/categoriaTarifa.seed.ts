import { PrismaClient } from "src/generated/prisma/client";

export async function seedCategoriaTarifa(prisma: PrismaClient) {
  const categorias = [
    {
      categoriaTarifaId: 1,
      nombre: "RESIDENCIAL",
      descripcion: "Tarifa para consumo doméstico estándar",
      valorBase: 4.0,
      valorExcedenteM3: 0.4,
      activo: true,
      consumoMinimoMensual: 0,
      aplicaSubsidio: false,
    },
    {
      categoriaTarifaId: 2,
      nombre: "COMERCIAL",
      descripcion: "Tarifa para locales comerciales y negocios",
      valorBase: 7.5,
      valorExcedenteM3: 0.75,
      activo: true,
      consumoMinimoMensual: 0,
      aplicaSubsidio: false,
    },
    {
      categoriaTarifaId: 3,
      nombre: "INDUSTRIAL",
      descripcion: "Tarifa para industrias y grandes consumidores",
      valorBase: 15.0,
      valorExcedenteM3: 1.5,
      activo: true,
      consumoMinimoMensual: 0,
      aplicaSubsidio: false,
    },
    {
      categoriaTarifaId: 4,
      nombre: "TERCERA EDAD",
      descripcion: "Tarifa subsidiada para adultos mayores (50% hasta 20m3)",
      valorBase: 4.0,
      valorExcedenteM3: 0.4,
      activo: true,
      consumoMinimoMensual: 0,
      aplicaSubsidio: true,
      porcentajeSubsidio: 50.00,
      limiteSubsidioM3: 20.00,
    },
    {
      categoriaTarifaId: 5,
      nombre: "DISCAPACIDAD",
      descripcion: "Tarifa subsidiada para personas con discapacidad",
      valorBase: 4.0,
      valorExcedenteM3: 0.4,
      activo: true,
      consumoMinimoMensual: 0,
      aplicaSubsidio: true,
      porcentajeSubsidio: 50.00,
      limiteSubsidioM3: 20.00,
    },
  ];

  const result: Awaited<ReturnType<typeof prisma.categoriaTarifa.findUnique>>[] = [];
  for (const c of categorias) {
    const created = await prisma.categoriaTarifa.upsert({
      where: { categoriaTarifaId: c.categoriaTarifaId },
      update: {
        nombre: c.nombre,
        descripcion: c.descripcion,
        valorBase: c.valorBase,
        consumoMinimoMensual: c.consumoMinimoMensual,
        valorExcedenteM3: c.valorExcedenteM3,
        activo: c.activo,
        aplicaSubsidio: c.aplicaSubsidio,
        porcentajeSubsidio: (c as any).porcentajeSubsidio ?? 0,
        limiteSubsidioM3: (c as any).limiteSubsidioM3 ?? 0,
      },
      create: {
        categoriaTarifaId: c.categoriaTarifaId,
        nombre: c.nombre,
        descripcion: c.descripcion,
        valorBase: c.valorBase,
        consumoMinimoMensual: c.consumoMinimoMensual,
        valorExcedenteM3: c.valorExcedenteM3,
        activo: c.activo,
        aplicaSubsidio: c.aplicaSubsidio,
        porcentajeSubsidio: (c as any).porcentajeSubsidio ?? 0,
        limiteSubsidioM3: (c as any).limiteSubsidioM3 ?? 0,
      },
    });
    result.push(created);
  }

  return result;
}
