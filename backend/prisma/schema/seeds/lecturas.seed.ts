import { PrismaClient } from "src/generated/prisma/client";

export async function seedLecturas(prisma: PrismaClient) {
    const periodos = [
        '2025-04', '2025-05', '2025-06', '2025-07', '2025-08', '2025-09',
        '2025-10', '2025-11', '2025-12', '2026-01', '2026-02', '2026-03'
    ];

    // Primero creamos los periodos si no existen para que las lecturas tengan a qué apuntar
    const periodosDb: any[] = [];
    for (const p of periodos) {
        const pDb = await prisma.periodos.upsert({
            where: { nombre: p },
            update: {},
            create: {
                nombre: p,
                fechaInicio: new Date(`${p}-01`),
                fechaFin: new Date(`${p}-28`),
                fechaVencimiento: new Date(`${p}-30`),
                estado: "ABIERTO" as any,
            }
        });
        periodosDb.push(pDb);
    }

    const contratos = await prisma.contratos.findMany({
        where: { estado: "ACTIVO" },
        select: { contratoId: true },
    });

    let lecturaId = 1;

    for (const contrato of contratos) {
        let lecturaAnterior = 0;
        for (const pDb of periodosDb) {
            const consumo = Math.floor(Math.random() * 30) + 5;
            const lecturaActual = lecturaAnterior + consumo;

            await prisma.lecturas.create({
                data: {
                    lecturaId: BigInt(lecturaId),
                    contratoId: contrato.contratoId,
                    periodoId: pDb.periodoId,
                    fecha: new Date(),
                    lecturaAnterior,
                    lecturaActual,
                    consumoCalculado: consumo,
                    estado: "APROBADA",
                    lecturaInicial: lecturaAnterior === 0,
                },
            });
            lecturaAnterior = lecturaActual;
            lecturaId++;
        }
    }

    return { contratosProcesados: contratos.length, periodos: periodos.length };
}
