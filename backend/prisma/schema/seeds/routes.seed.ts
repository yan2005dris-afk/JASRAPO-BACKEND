import { PrismaClient } from "src/generated/prisma/client";

export async function seedRoutes(prisma: PrismaClient) {
  const periodo = await prisma.periodos.findFirst({
    where: { estado: 'ABIERTO' },
    orderBy: { periodoId: 'desc' },
    select: { periodoId: true },
  });

  if (!periodo) {
    console.log('⚠️  No active period found — skipping routes seed.');
    return { rutasCreadas: 0, lecturasInicializadas: 0 };
  }

  const operadores = await prisma.usuarios.findMany({
    where: { rol: { nombre: 'operadores' } },
    select: { usuarioId: true },
  });

  if (operadores.length === 0) {
    console.log('⚠️  No operators found — skipping routes seed.');
    return { rutasCreadas: 0, lecturasInicializadas: 0 };
  }

  // Group active contracts by comunidad+sector to derive TOMA_LECTURA zones
  const contratos = await prisma.contratos.findMany({
    where: { estado: 'ACTIVO', deletedAt: null },
    orderBy: [{ comunidadId: 'asc' }, { sectorId: 'asc' }, { contratoId: 'asc' }],
    select: {
      comunidadId: true,
      sectorId: true,
      historialMedidores: {
        where: { fechaHasta: null },
        select: {
          medidor: { select: { medidorId: true, estado: true } },
        },
      },
    },
  });

  const zonesMap = new Map<string, {
    comunidadId: number;
    sectorId: number | null;
    medidorIds: bigint[];
  }>();

  for (const contrato of contratos) {
    const key = `${contrato.comunidadId}:${contrato.sectorId ?? 'null'}`;
    if (!zonesMap.has(key)) {
      zonesMap.set(key, {
        comunidadId: contrato.comunidadId,
        sectorId: contrato.sectorId,
        medidorIds: [],
      });
    }
    const zone = zonesMap.get(key)!;
    for (const h of contrato.historialMedidores) {
      if (
        h.medidor.estado === 'INSTALADO' &&
        !zone.medidorIds.some((id) => id === h.medidor.medidorId)
      ) {
        zone.medidorIds.push(h.medidor.medidorId);
      }
    }
  }

  let rutasCount = 0;
  let lecturasCount = 0;
  let opIdx = 0;

  for (const zone of zonesMap.values()) {
    if (zone.medidorIds.length === 0) continue;

    const operarioId = operadores[opIdx % operadores.length].usuarioId;
    opIdx++;

    const rutaNombre = `Lectura C${zone.comunidadId}${zone.sectorId != null ? `-S${zone.sectorId}` : ''}`;

    const existingRuta = await prisma.rutas.findFirst({
      where: {
        tipoRuta: 'TOMA_LECTURA',
        comunidadId: zone.comunidadId,
        sectorId: zone.sectorId,
        periodoId: periodo.periodoId,
        deletedAt: null,
      },
      select: { rutaId: true },
    });

    if (!existingRuta) {
      await prisma.rutas.create({
        data: {
          nombre: rutaNombre,
          tipoRuta: 'TOMA_LECTURA',
          operarioId,
          comunidadId: zone.comunidadId,
          sectorId: zone.sectorId,
          periodoId: periodo.periodoId,
          estado: 'PENDIENTE',
        },
      });
      rutasCount++;
    }

    // Initialize one reading per meter for the active period (lecturaActual = 0)
    for (const medidorId of zone.medidorIds) {
      const existingLectura = await prisma.lecturas.findFirst({
        where: { medidorId, periodoId: periodo.periodoId },
        select: { lecturaId: true },
      });

      if (existingLectura) continue;

      const prevLectura = await prisma.lecturas.findFirst({
        where: { medidorId },
        orderBy: { fecha: 'desc' },
        select: { lecturaActual: true },
      });

      const seedDate = new Date(Date.UTC(2026, 0, 1, 12, 0, 0));
      await prisma.lecturas.create({
        data: {
          medidorId,
          periodoId: periodo.periodoId,
          fecha: seedDate,
          lecturaAnterior: prevLectura?.lecturaActual ?? 0,
          lecturaActual: 0,
          consumoCalculado: 0,
          estado: 'PENDIENTE',
          lecturaInicial: prevLectura == null,
        },
      });
      lecturasCount++;
    }
  }

  // Sample work-order routes (RECONEXION, INSTALACION, INSPECCION) using meters from the first zone
  const firstZone = [...zonesMap.values()].find((z) => z.medidorIds.length >= 3);
  if (firstZone) {
    const workOrders = [
      { tipo: 'RECONEXION' as const, nombre: 'Reconexión - muestra' },
      { tipo: 'INSTALACION' as const, nombre: 'Instalación - muestra' },
      { tipo: 'INSPECCION' as const, nombre: 'Inspección - muestra' },
    ];
    for (let i = 0; i < workOrders.length; i++) {
      await prisma.rutas.create({
        data: {
          nombre: workOrders[i].nombre,
          tipoRuta: workOrders[i].tipo,
          operarioId: operadores[i % operadores.length].usuarioId,
          comunidadId: firstZone.comunidadId,
          sectorId: firstZone.sectorId,
          medidorId: firstZone.medidorIds[i],
          estado: 'PENDIENTE',
        },
      });
      rutasCount++;
    }
  }

  console.log(`✅ ${rutasCount} routes created, ${lecturasCount} readings initialized to 0.`);
  return { rutasCreadas: rutasCount, lecturasInicializadas: lecturasCount };
}
