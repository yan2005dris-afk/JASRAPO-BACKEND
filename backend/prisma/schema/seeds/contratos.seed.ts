import { PrismaClient } from "src/generated/prisma/client";

export async function seedContratos(prisma: PrismaClient) {
    const contratos = [];
    const sectores = [1, 2, 3, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];
    const categorias = [1, 4, 5];

    // Contratos originales
    const contratosBase = [
        { contratoId: 13, clienteId: 7, sectorId: 1, categoriaTarifaId: 1, numeroGuia: "GUIA-001", codigoInterno: "INT-0007" },
        { contratoId: 14, clienteId: 8, sectorId: 1, categoriaTarifaId: 1, numeroGuia: "GUIA-002", codigoInterno: "INT-0008" },
        { contratoId: 15, clienteId: 9, sectorId: 2, categoriaTarifaId: 1, numeroGuia: "GUIA-003", codigoInterno: "INT-0009" },
        { contratoId: 16, clienteId: 8, sectorId: 3, categoriaTarifaId: 4, numeroGuia: "GUIA-NUÑEZ-001", codigoInterno: "INT-NUÑEZ-001" },
        { contratoId: 17, clienteId: 9, sectorId: 3, categoriaTarifaId: 5, numeroGuia: "GUIA-NUÑEZ-002", codigoInterno: "INT-NUÑEZ-002" },
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
    let contratoId = 18;
    for (let clienteId = 10; clienteId <= 109; clienteId++) {
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
