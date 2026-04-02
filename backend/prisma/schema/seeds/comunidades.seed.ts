import { PrismaClient } from "src/generated/prisma/client";

export async function seedComunidades(prisma: PrismaClient) {
    const comunidades = [
        { comunidadId: 1, nombre: "Olon", codigo: "001", porcentajeTasaSeguridad: 5 },
        { comunidadId: 2, nombre: "Nuñez", codigo: "002", porcentajeTasaSeguridad: 0 },
        { comunidadId: 3, nombre: "La Entrada", codigo: "003", porcentajeTasaSeguridad: 3 },
        { comunidadId: 4, nombre: "San Jose", codigo: "004", porcentajeTasaSeguridad: 2 },
        { comunidadId: 5, nombre: "Curia", codigo: "005", porcentajeTasaSeguridad: 0 },
    ];

    const result: Awaited<ReturnType<typeof prisma.comunidades.findUnique>>[] = [];
    for (const c of comunidades) {
        const created = await prisma.comunidades.upsert({
            where: { comunidadId: c.comunidadId },
            update: {},
            create: c,
        });
        result.push(created);
    }

    return result;
}
