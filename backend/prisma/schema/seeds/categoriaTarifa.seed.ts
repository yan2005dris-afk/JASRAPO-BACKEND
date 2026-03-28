import { PrismaClient } from "src/generated/prisma/client";

export async function seedCategoriaTarifa(prisma: PrismaClient) {
    const categorias = [
        { categoriaId: 1, nombre: "Tipo 1", descripcion: "Tarifa tipo 1", valorBase: 4.0, limiteBaseM3: 10, valorExcedenteM3: 0.40, activo: true },
        { categoriaId: 4, nombre: "Tipo 2", descripcion: "Tarifa tipo 2", valorBase: 7.5, limiteBaseM3: 10, valorExcedenteM3: 0.75, activo: true },
        { categoriaId: 5, nombre: "Tipo 3", descripcion: "Tarifa tipo 3", valorBase: 15.0, limiteBaseM3: 10, valorExcedenteM3: 1.50, activo: true },
    ];

    const result = [];
    for (const c of categorias) {
        const created = await prisma.categoriaTarifa.upsert({
            where: { categoriaId: c.categoriaId },
            update: {},
            create: c,
        });
        result.push(created);
    }

    return result;
}
