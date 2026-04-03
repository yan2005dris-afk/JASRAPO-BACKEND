import { PrismaClient } from "src/generated/prisma/client";

export async function seedSectores(prisma: PrismaClient) {
    const sectores = [
        // Olon (comunidad 1)
        { sectorId: 1, comunidadId: 1, codigo: "SEC-NORTE", nombre: "Sector Norte" },
        { sectorId: 2, comunidadId: 1, codigo: "SEC-SUR", nombre: "Sector Sur" },
        { sectorId: 3, comunidadId: 1, codigo: "SEC-OLON-NORTE", nombre: "Sector Norte Olon" },
        { sectorId: 4, comunidadId: 1, codigo: "SEC-OLON-SUR", nombre: "Sector Sur Olon" },
        { sectorId: 5, comunidadId: 1, codigo: "SEC-OLON-CENTRO", nombre: "Sector Centro Olon" },
        // Nuñez (comunidad 2)
        { sectorId: 6, comunidadId: 2, codigo: "SEC-NUÑEZ", nombre: "Sector Nuñez" },
        { sectorId: 7, comunidadId: 2, codigo: "SEC-NUÑEZ-URBANO", nombre: "Sector Urbano" },
        { sectorId: 8, comunidadId: 2, codigo: "SEC-NUÑEZ-RURAL", nombre: "Sector Rural" },
        // La Entrada (comunidad 3)
        { sectorId: 9, comunidadId: 3, codigo: "SEC-ENTRADA-OESTE", nombre: "Sector Oeste" },
        { sectorId: 10, comunidadId: 3, codigo: "SEC-ENTRADA-ESTE", nombre: "Sector Este" },
        // San Jose (comunidad 4)
        { sectorId: 11, comunidadId: 4, codigo: "SEC-SJ-CENTRO", nombre: "Sector Centro" },
        { sectorId: 12, comunidadId: 4, codigo: "SEC-SJ-PERIFERIA", nombre: "Sector Periferia" },
        // Curia (comunidad 5)
        { sectorId: 13, comunidadId: 5, codigo: "SEC-CURIA-RURAL", nombre: "Sector Rural" },
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
