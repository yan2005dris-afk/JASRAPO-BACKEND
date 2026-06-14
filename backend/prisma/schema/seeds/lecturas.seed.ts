import { PrismaClient } from "src/generated/prisma/client";

export async function seedLecturas(prisma: PrismaClient) {
    // Un periodo por año (regla de negocio: un periodo anual)
    const periodos = [
        { nombre: '2024', fechaInicio: '2024-01-01', fechaFin: '2024-12-31', vencimiento: '2025-01-15' },
        { nombre: '2025', fechaInicio: '2025-01-01', fechaFin: '2025-12-31', vencimiento: '2026-01-15' },
        { nombre: '2026', fechaInicio: '2026-01-01', fechaFin: '2026-12-31', vencimiento: '2027-01-15' },
    ];

    // Primero creamos los periodos si no existen para que las lecturas tengan a qué apuntar
    const periodosDb: any[] = [];
    for (const p of periodos) {
        const pDb = await prisma.periodos.upsert({
            where: { nombre: p.nombre },
            update: {},
            create: {
                nombre: p.nombre,
                fechaInicio: new Date(p.fechaInicio),
                fechaFin: new Date(p.fechaFin),
                fechaVencimiento: new Date(p.vencimiento),
                estado: "ABIERTO" as any,
            }
        });
        periodosDb.push(pDb);
    }

    const contratos = await prisma.contratos.findMany({
        where: { estado: "ACTIVO" },
        include: { historialMedidores: { where: { fechaHasta: null } } },
    });

    let lecturaId = 1;

    for (const contrato of contratos) {
        const medidorId = contrato.historialMedidores[0]?.medidorId;
        if (!medidorId) continue;

        let lecturaAnterior = 0;
        for (const pDb of periodosDb) {
            const consumo = Math.floor(Math.random() * 30) + 5;
            const lecturaActual = lecturaAnterior + consumo;

            await prisma.lecturas.create({
                data: {
                    lecturaId: BigInt(lecturaId),
                    medidorId: medidorId,
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
