import { PrismaClient } from "src/generated/prisma/client";

export async function seedContratos(prisma: PrismaClient) {
    const contratos: Awaited<ReturnType<typeof prisma.contratos.findUnique>>[] = [];
    const sectores = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    const categorias = [1, 2, 3];

    // Contratos originales
    const contratosBase = [
        { contratoId: 1, clienteId: 1, sectorId: 1, categoriaTarifaId: 1, numeroGuia: "GUIA-001", codigoInterno: "INT-0001" },
        { contratoId: 2, clienteId: 2, sectorId: 1, categoriaTarifaId: 1, numeroGuia: "GUIA-002", codigoInterno: "INT-0002" },
        { contratoId: 3, clienteId: 3, sectorId: 2, categoriaTarifaId: 1, numeroGuia: "GUIA-003", codigoInterno: "INT-0003" },
        { contratoId: 4, clienteId: 2, sectorId: 3, categoriaTarifaId: 2, numeroGuia: "GUIA-NUÑEZ-001", codigoInterno: "INT-NUÑEZ-001" },
        { contratoId: 5, clienteId: 3, sectorId: 3, categoriaTarifaId: 3, numeroGuia: "GUIA-NUÑEZ-002", codigoInterno: "INT-NUÑEZ-002" },
    ];

    for (const c of contratosBase) {
        const created = await prisma.contratos.upsert({
            where: { contratoId: c.contratoId },
            update: {},
            create: {
                ...c,
                direccionSuministro: `Direccion contrato ${c.contratoId}`,
                estado: "ACTIVO",
            },
        });
        contratos.push(created);
    }

    // Generar 100 contratos adicionales
    let contratoId = 6;
    for (let clienteId = 4; clienteId <= 103; clienteId++) {
        const sectorId = sectores[Math.floor(Math.random() * sectores.length)];
        const categoriaTarifaId = categorias[Math.floor(Math.random() * categorias.length)];
        
        const sectorCodigo = await prisma.sectores.findUnique({ where: { sectorId } });
        
        const created = await prisma.contratos.create({
            data: {
                contratoId,
                clienteId,
                sectorId,
                categoriaTarifaId,
                numeroGuia: `GUIA-${sectorCodigo?.codigo || 'SEC'}-${clienteId.toString().padStart(4, '0')}`,
                codigoInterno: `INT-${clienteId.toString().padStart(4, '0')}`,
                direccionSuministro: `Direccion contrato ${contratoId}`,
                estado: "ACTIVO",
            },
        });
        contratos.push(created);
        contratoId++;
    }

    return contratos;
}
