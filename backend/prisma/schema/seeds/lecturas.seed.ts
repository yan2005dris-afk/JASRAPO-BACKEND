import { PrismaClient } from "src/generated/prisma/client";

export async function seedLecturas(prisma: PrismaClient) {
    const periodos = [
        '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09',
        '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'
    ];

    const contratos = await prisma.contratos.findMany({
        where: { estado: "ACTIVO" },
        select: { contratoId: true },
    });

    let lecturaId = 1;

    for (const contrato of contratos) {
        for (const periodo of periodos) {
            const lecturaAnterior = Math.floor(Math.random() * 100) + 50;
            const consumo = Math.floor(Math.random() * 30) + 5;
            const lecturaActual = lecturaAnterior + consumo;

            await prisma.lecturas.create({
                data: {
                    lecturaId,
                    contratoId: contrato.contratoId,
                    periodo,
                    fecha: new Date(),
                    lecturaAnterior,
                    lecturaActual,
                    consumoCalculado: consumo,
                    isValidada: true,
                    lecturaInicial: Math.floor(Math.random() * 50) + 10,
                    tieneAnomalia: false,
                },
            });
            lecturaId++;
        }
    }

    return { contratosProcesados: contratos.length, periodos };
}
