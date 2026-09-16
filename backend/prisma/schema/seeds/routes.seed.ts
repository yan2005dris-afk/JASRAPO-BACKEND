import { PrismaClient } from 'src/generated/prisma/client';

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

  const tipoActividads = await prisma.tipoActividad.findMany({
    select: { tipoActividadId: true, codigo: true },
  });
  const tipoActividadIdByCode = new Map(
    tipoActividads.map((type) => [type.codigo, type.tipoActividadId]),
  );

  const operadores = await prisma.usuarios.findMany({
    where: { rol: { nombre: 'operadores' } },
    select: { usuarioId: true },
  });

  if (operadores.length === 0) {
    console.log('⚠️  No operators found — skipping routes seed.');
    return { rutasCreadas: 0, lecturasInicializadas: 0 };
  }

  // Group active contracts by comunidad+sector to derive TOMA_LECTURA zones
  // Keep the development dataset ready for manual operator testing on every seed run.
  // Historical readings remain untouched; only active-period operational work is reset.
  await prisma.ordenesTrabajo.updateMany({
    where: { ruta: { periodoId: periodo.periodoId } },
    data: {
      estado: 'PENDIENTE',
      resultadoObservacion: null,
      evidenciaFotoUrl: null,
      completadoEn: null,
    },
  });
  await prisma.rutas.updateMany({
    where: { periodoId: periodo.periodoId },
    data: { estado: 'PENDIENTE' },
  });

  const contratos = await prisma.contratos.findMany({
    where: { estado: 'ACTIVO', deletedAt: null },
    orderBy: [
      { comunidadId: 'asc' },
      { sectorId: 'asc' },
      { contratoId: 'asc' },
    ],
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

  const zonesMap = new Map<
    string,
    {
      comunidadId: number;
      sectorId: number | null;
      medidorIds: bigint[];
    }
  >();

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
        tipoActividad: { codigo: 'LECTURA' },
        comunidadId: zone.comunidadId,
        sectorId: zone.sectorId,
        periodoId: periodo.periodoId,
        deletedAt: null,
      },
      select: { rutaId: true },
    });

    let createdRuta = existingRuta;
    if (!createdRuta) {
      createdRuta = await prisma.rutas.create({
        data: {
          nombre: rutaNombre,
          tipoActividadId: tipoActividadIdByCode.get('LECTURA')!,
          operarioId,
          comunidadId: zone.comunidadId,
          sectorId: zone.sectorId,
          periodoId: periodo.periodoId,
          estado: 'PENDIENTE',
        },
      });
      rutasCount++;
    }

    // Initialize readings and linked ordenesTrabajo per meter for the active period
    let visitOrder = 1;
    for (const medidorId of zone.medidorIds) {
      // Keep approved historical readings immutable. The route gets a dedicated
      // operational reading so the operator starts from PENDIENTE.
      const seedDate = new Date(Date.UTC(2026, 7, 1, 12, 0, 0));
      const existingLectura = await prisma.lecturas.findFirst({
        where: { medidorId, periodoId: periodo.periodoId, fecha: seedDate },
        select: { lecturaId: true },
      });

      let currentLecturaId = existingLectura?.lecturaId;

      if (!existingLectura) {
        const prevLectura = await prisma.lecturas.findFirst({
          where: { medidorId },
          orderBy: { fecha: 'desc' },
          select: { lecturaActual: true },
        });

        const newLectura = await prisma.lecturas.create({
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
        currentLecturaId = newLectura.lecturaId;
        lecturasCount++;
      }

      // Create linked orden_trabajo of type LECTURA
      const contractHist = await prisma.historialMedidores.findFirst({
        where: { medidorId, fechaHasta: null },
        select: { contratoId: true },
      });

      if (contractHist && createdRuta) {
        const existingOT = await prisma.ordenesTrabajo.findFirst({
          where: {
            rutaId: createdRuta.rutaId,
            contratoId: contractHist.contratoId,
          },
        });

        if (!existingOT) {
          await prisma.ordenesTrabajo.create({
            data: {
              rutaId: createdRuta.rutaId,
              contratoId: contractHist.contratoId,
              medidorId,
              lecturaId: currentLecturaId,
              estado: 'PENDIENTE',
              ordenVisita: visitOrder++,
            },
          });
        }
      }
    }
  }

  // Sample work-order routes (INSTALACION, RECONEXION, INSPECCION)
  const allActiveContratos = await prisma.contratos.findMany({
    where: { deletedAt: null },
    include: {
      historialMedidores: { where: { fechaHasta: null } },
      cliente: true,
    },
    take: 10,
  });

  if (allActiveContratos.length >= 3) {
    const workRouteDefs = [
      {
        tipo: 'INSTALACION' as const,
        nombre: 'Ruta Instalación de Medidores - Nueva Alborada',
        contratoIdx: 0,
        estado: 'PENDIENTE' as const,
        obs: 'Instalación programada de medidor de 1/2 pulgada.',
      },
      {
        tipo: 'RECONEXION' as const,
        nombre: 'Ruta Reconexión - Sector Central',
        contratoIdx: 1,
        estado: 'PENDIENTE' as const,
        obs: 'Reconexión tras pago de saldo pendiente.',
      },
      {
        tipo: 'INSPECCION' as const,
        nombre: 'Ruta Inspección Técnica por Fuga / Anomalía',
        contratoIdx: 2,
        estado: 'PENDIENTE' as const,
        obs: 'Inspección técnica de presión y verificación de sello.',
      },
    ];

    for (let i = 0; i < workRouteDefs.length; i++) {
      const def = workRouteDefs[i];
      const targetContrato = allActiveContratos[def.contratoIdx];
      const assignedMedidorId =
        targetContrato.historialMedidores[0]?.medidorId ?? null;

      const ruta = await prisma.rutas.create({
        data: {
          nombre: def.nombre,
          tipoActividadId: tipoActividadIdByCode.get(def.tipo)!,
          operarioId: operadores[i % operadores.length].usuarioId,
          comunidadId: targetContrato.comunidadId,
          sectorId: targetContrato.sectorId,
          // FIX: asignar al mismo período activo que las rutas TOMA_LECTURA.
          // Sin esto, las rutas de INSTALACION/RECONEXION/INSPECCION quedan
          // huérfanas (periodo_id NULL) y el backend las excluye del GET /operator/routes
          // porque filtra por WHERE periodoId = periodoActivo.
          periodoId: periodo.periodoId,
          estado: def.estado,
          fechaPlanificada: new Date(Date.UTC(2026, 7, 20, 9, 0, 0)),
        },
      });

      await prisma.ordenesTrabajo.create({
        data: {
          rutaId: ruta.rutaId,
          contratoId: targetContrato.contratoId,
          medidorId: assignedMedidorId,
          estado: 'PENDIENTE',
          ordenVisita: 1,
          resultadoObservacion: null,
          completadoEn: null,
        },
      });
      rutasCount++;
    }
  }

  console.log(
    `✅ ${rutasCount} routes created, ${lecturasCount} readings initialized to 0.`,
  );
  return { rutasCreadas: rutasCount, lecturasInicializadas: lecturasCount };
}
