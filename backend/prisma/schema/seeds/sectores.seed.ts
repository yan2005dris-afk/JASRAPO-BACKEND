import { PrismaClient } from "src/generated/prisma/client";

export async function seedSectores(prisma: PrismaClient) {
    const sectores = [
        // Olon (comunidad 1)
        { sectorId: 1, comunidadId: 1, codigo: "SEC-NORTE", nombre: "Sector Norte" },
        { sectorId: 2, comunidadId: 1, codigo: "SEC-SUR", nombre: "Sector Sur" },
        { sectorId: 12, comunidadId: 1, codigo: "SEC-OLON-NORTE", nombre: "Sector Norte Olon" },
        { sectorId: 13, comunidadId: 1, codigo: "SEC-OLON-SUR", nombre: "Sector Sur Olon" },
        { sectorId: 14, comunidadId: 1, codigo: "SEC-OLON-CENTRO", nombre: "Sector Centro Olon" },
        // Nuñez (comunidad 4)
        { sectorId: 3, comunidadId: 4, codigo: "SEC-NUÑEZ", nombre: "Sector Nuñez" },
        { sectorId: 15, comunidadId: 4, codigo: "SEC-NUÑEZ-URBANO", nombre: "Sector Urbano" },
        { sectorId: 16, comunidadId: 4, codigo: "SEC-NUÑEZ-RURAL", nombre: "Sector Rural" },
        // La Entrada (comunidad 8)
        { sectorId: 17, comunidadId: 8, codigo: "SEC-ENTRADA-OESTE", nombre: "Sector Oeste" },
        { sectorId: 18, comunidadId: 8, codigo: "SEC-ENTRADA-ESTE", nombre: "Sector Este" },
        // San Jose (comunidad 9)
        { sectorId: 19, comunidadId: 9, codigo: "SEC-SJ-CENTRO", nombre: "Sector Centro" },
        { sectorId: 20, comunidadId: 9, codigo: "SEC-SJ-PERIFERIA", nombre: "Sector Periferia" },
        // Curia (comunidad 10)
        { sectorId: 21, comunidadId: 10, codigo: "SEC-CURIA-RURAL", nombre: "Sector Rural" },
    ];

    const result = [];
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
