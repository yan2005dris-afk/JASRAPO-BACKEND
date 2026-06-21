import { PrismaClient, EstadoMedidor } from "src/generated/prisma/client";

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
    });

    // Encontrar el medidorId máximo existente para generar nuevos IDs únicos
    const maxMedidor = await prisma.medidores.findFirst({
        orderBy: { medidorId: 'desc' },
    });
    let nextMedidorId = Number(maxMedidor?.medidorId ?? 0) + 1;

    let lecturaId = 1;

    for (const contrato of contratos) {
        // Limpiar historial existente para este contrato, así cada contrato
        // tiene lecturas únicas sin mezclarse con otros contratos
        await prisma.historialMedidores.deleteMany({
            where: { contratoId: contrato.contratoId },
        });

        // Crear un medidor DEDICADO por contrato para evitar que lecturas
        // de diferentes contratos compartan el mismo medidorId
        const medidor = await prisma.medidores.create({
            data: {
                medidorId: nextMedidorId,
                marca: 'Seed',
                modelo: 'Dedicado',
                serie: `SER-READ-${contrato.contratoId}`,
                fechaInstalacion: new Date('2024-01-01'),
                latitud: -0.2281,
                longitud: -78.0023,
                estado: 'INSTALADO' as EstadoMedidor,
                createdAt: new Date(),
                updatedAt: new Date(),
                deletedAt: null,
            },
        });
        nextMedidorId++;

        // Crear historial para el nuevo medidor dedicado
        const historial = await prisma.historialMedidores.create({
            data: {
                medidorId: medidor.medidorId,
                contratoId: contrato.contratoId,
                fechaDesde: new Date('2024-01-01'),
                lecturaInicial: 0,
                motivo: 'ASIGNACION_INICIAL',
                observacion: `Medidor dedicado para contrato ${contrato.contratoId} (seed)`,
            },
        });

        let lecturaAnterior = 0;

        const currentPeriodId = periodosDb[periodosDb.length - 1]?.periodoId;

        for (const pDb of periodosDb) {
            // 12 lecturas mensuales por período (año)
            const año = parseInt(pDb.nombre, 10); // Usar el nombre del período (e.g. "2024") para evitar timezone offset
            for (let mes = 0; mes < 12; mes++) {
                // Usar constructora UTC para evitar rollover de días por timezone
                // (new Date('2024-01-01') es Dec 31 en Ecuador, causando getFullYear() → 2023)
                const fechaLectura = new Date(Date.UTC(año, mes, 15, 12, 0, 0));

                const consumo = Math.floor(Math.random() * 30) + 5;
                const lecturaActual = lecturaAnterior + consumo;

                await prisma.lecturas.create({
                    data: {
                        lecturaId: BigInt(lecturaId),
                        medidorId: medidor.medidorId,
                        periodoId: pDb.periodoId,
                        fecha: fechaLectura,
                        lecturaAnterior,
                        lecturaActual,
                        consumoCalculado: consumo,
                        estado: pDb.periodoId === currentPeriodId ? "PENDIENTE" : "APROBADA",
                        lecturaInicial: lecturaAnterior === 0,
                    },
                });
                lecturaAnterior = lecturaActual;
                lecturaId++;
            }
        }
    }

    return { contratosProcesados: contratos.length, periodos: periodos.length };
}
