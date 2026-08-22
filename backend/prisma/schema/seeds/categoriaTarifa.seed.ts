import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedCategoriaTarifa(prisma: PrismaClient) {
  const categorias = [
    {
      categoriaTarifaId: 1,
      nombre: 'RESIDENCIAL',
      descripcion: 'Tarifa para consumo doméstico estándar',
      activo: true,
    },
    {
      categoriaTarifaId: 2,
      nombre: 'COMERCIAL',
      descripcion: 'Tarifa para locales comerciales y negocios',
      activo: true,
    },
    {
      categoriaTarifaId: 3,
      nombre: 'INDUSTRIAL',
      descripcion: 'Tarifa para industrias y grandes consumidores',
      activo: true,
    },
  ];

  const result: any[] = [];
  for (const c of categorias) {
    const created = await prisma.categoriaTarifa.upsert({
      where: { categoriaTarifaId: c.categoriaTarifaId },
      update: {
        nombre: c.nombre,
        descripcion: c.descripcion,
        activo: c.activo,
      },
      create: {
        categoriaTarifaId: c.categoriaTarifaId,
        nombre: c.nombre,
        descripcion: c.descripcion,
        activo: c.activo,
      },
    });
    result.push(created);
  }

  return result;
}
