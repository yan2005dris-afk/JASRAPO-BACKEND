import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedCategoriaTarifa(prisma: PrismaClient) {
  const categorias = [
    {
      categoriaTarifaId: 1,
      nombre: 'RESIDENCIAL',
      descripcion: 'Tarifa para consumo doméstico estándar',
      valorBase: 4.0,
      valorExcedenteM3: 0.4,
      activo: true,
      consumoMinimoMensual: 10,
    },
    {
      categoriaTarifaId: 2,
      nombre: 'COMERCIAL',
      descripcion: 'Tarifa para locales comerciales y negocios',
      valorBase: 7.5,
      valorExcedenteM3: 0.75,
      activo: true,
      consumoMinimoMensual: 10,
    },
    {
      categoriaTarifaId: 3,
      nombre: 'INDUSTRIAL',
      descripcion: 'Tarifa para industrias y grandes consumidores',
      valorBase: 15.0,
      valorExcedenteM3: 1.5,
      activo: true,
      consumoMinimoMensual: 10,
    },
  ];

  const result: any[] = [];
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
      },
      create: {
        categoriaTarifaId: c.categoriaTarifaId,
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
