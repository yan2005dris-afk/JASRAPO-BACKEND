import { PrismaClient } from "src/generated/prisma/client";

export async function seedSectores(prisma: PrismaClient) {
    const sectores = [
        // Olon (comunidad 1) - Solo Olón tiene sectores reales según requerimiento
        { sectorId: 1, comunidadId: 1, codigo: "SEC-OLON-NORTE", nombre: "Sector Norte Olón" },
        { sectorId: 2, comunidadId: 1, codigo: "SEC-OLON-SUR", nombre: "Sector Sur Olón" },
        { sectorId: 3, comunidadId: 1, codigo: "SEC-OLON-CENTRO", nombre: "Sector Centro Olón" },
        { sectorId: 4, comunidadId: 1, codigo: "SEC-OLON-PLAYA", nombre: "Sector Playa Olón" },
    ];

    const result: Awaited<ReturnType<typeof prisma.sectores.findUnique>>[] = [];
    for (const s of sectores) {
        const created = await prisma.sectores.upsert({
            where: { sectorId: s.sectorId },
            update: {},
            create: s,
        });
        result.push(created);
    }

    return result;
}
