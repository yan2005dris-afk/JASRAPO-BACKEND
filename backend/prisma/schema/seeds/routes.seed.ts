import { PrismaClient } from "src/generated/prisma/client";

export async function seedRoutes(prisma: PrismaClient) {
  // Obtener usuarios con rol de operadores para asignar como operarios
  const operadores = await prisma.usuarios.findMany({
    where: {
      rol: {
        nombre: "operadores",
      },
    },
    select: { usuarioId: true },
  });

  // Si no hay operadores, usamos el primero disponible
  const operarioId = operadores.length > 0 ? operadores[0].usuarioId : 1;

  // Obtener comunidades y sectores disponibles
  const comunidades = await prisma.comunidades.findMany({
    select: { comunidadId: true },
  });

  const sectores = await prisma.sectores.findMany({
    select: { sectorId: true, comunidadId: true },
  });

  // Período activo para asignar a las rutas
  const periodoActivo = await prisma.periodos.findFirst({
    where: { estado: 'ABIERTO' },
    orderBy: { periodoId: 'desc' },
    select: { periodoId: true },
  });
  const periodoId = periodoActivo?.periodoId ?? undefined;

  // Rutas de TOMA_LECTURA en diferentes estados
  const rutasTomaLectura = [
    {
      rutaId: BigInt(1),
      periodoId,
      nombre: "Ruta Olón Norte - Lectura",
      descripcion: "Ruta para toma de lectura del sector norte de Olón",
      tipoRuta: "TOMA_LECTURA" as const,
      comunidadId: comunidades[0]?.comunidadId || 1,
      sectorId: sectores.find((s) => s.comunidadId === 1 && s.sectorId === 1)?.sectorId || 1,
      estado: "PENDIENTE" as const,
      fechaPlanificada: new Date("2026-05-15"),
    },
    {
      rutaId: BigInt(2),
      periodoId,
      nombre: "Ruta Olón Sur - Lectura",
      descripcion: "Ruta para toma de lectura del sector sur de Olón",
      tipoRuta: "TOMA_LECTURA" as const,
      comunidadId: comunidades[0]?.comunidadId || 1,
      sectorId: sectores.find((s) => s.comunidadId === 1 && s.sectorId === 2)?.sectorId || 2,
      estado: "EN_PROGRESO" as const,
      fechaPlanificada: new Date("2026-05-15"),
      fechaInicio: new Date("2026-05-15T08:00:00"),
    },
    {
      rutaId: BigInt(3),
      periodoId,
      nombre: "Ruta Olón Centro - Lectura",
      descripcion: "Ruta para toma de lectura del sector centro de Olón",
      tipoRuta: "TOMA_LECTURA" as const,
      comunidadId: comunidades[0]?.comunidadId || 1,
      sectorId: sectores.find((s) => s.comunidadId === 1 && s.sectorId === 3)?.sectorId || 3,
      estado: "COMPLETADA" as const,
      fechaPlanificada: new Date("2026-05-10"),
      fechaInicio: new Date("2026-05-10T08:00:00"),
      fechaFin: new Date("2026-05-10T14:00:00"),
    },
    {
      rutaId: BigInt(4),
      periodoId,
      nombre: "Ruta Olón Playa - Lectura",
      descripcion: "Ruta para toma de lectura del sector playa de Olón",
      tipoRuta: "TOMA_LECTURA" as const,
      comunidadId: comunidades[0]?.comunidadId || 1,
      sectorId: sectores.find((s) => s.comunidadId === 1 && s.sectorId === 4)?.sectorId || 4,
      estado: "PARCIAL" as const,
      fechaPlanificada: new Date("2026-05-12"),
      fechaInicio: new Date("2026-05-12T08:00:00"),
    },
    {
      rutaId: BigInt(5),
      periodoId,
      nombre: "Ruta Nuñez - Lectura",
      descripcion: "Ruta para toma de lectura de Nuñez",
      tipoRuta: "TOMA_LECTURA" as const,
      comunidadId: comunidades[1]?.comunidadId || 2,
      sectorId: null,
      estado: "PENDIENTE" as const,
      fechaPlanificada: new Date("2026-05-16"),
    },
    {
      rutaId: BigInt(6),
      periodoId,
      nombre: "Ruta La Entrada - Lectura",
      descripcion: "Ruta para toma de lectura de La Entrada",
      tipoRuta: "TOMA_LECTURA" as const,
      comunidadId: comunidades[2]?.comunidadId || 3,
      sectorId: null,
      estado: "CANCELADA" as const,
      fechaPlanificada: new Date("2026-05-14"),
    },
  ];

  // Rutas de RECONEXION en diferentes estados (no llevan periodoId)
  const rutasReconexion = [
    {
      rutaId: BigInt(7),
      nombre: "Ruta Olón Norte - Reconexión",
      descripcion: "Ruta para reconexiones del sector norte de Olón",
      tipoRuta: "RECONEXION" as const,
      comunidadId: comunidades[0]?.comunidadId || 1,
      sectorId: sectores.find((s) => s.comunidadId === 1 && s.sectorId === 1)?.sectorId || 1,
      estado: "PENDIENTE" as const,
      fechaPlanificada: new Date("2026-05-20"),
    },
    {
      rutaId: BigInt(8),
      nombre: "Ruta Nuñez - Reconexión",
      descripcion: "Ruta para reconexiones de Nuñez",
      tipoRuta: "RECONEXION" as const,
      comunidadId: comunidades[1]?.comunidadId || 2,
      sectorId: null,
      estado: "EN_PROGRESO" as const,
      fechaPlanificada: new Date("2026-05-18"),
      fechaInicio: new Date("2026-05-18T09:00:00"),
    },
    {
      rutaId: BigInt(9),
      nombre: "Ruta San Jose - Reconexión",
      descripcion: "Ruta para reconexiones de San Jose",
      tipoRuta: "RECONEXION" as const,
      comunidadId: comunidades[3]?.comunidadId || 4,
      sectorId: null,
      estado: "COMPLETADA" as const,
      fechaPlanificada: new Date("2026-05-05"),
      fechaInicio: new Date("2026-05-05T10:00:00"),
      fechaFin: new Date("2026-05-05T16:00:00"),
    },
    {
      rutaId: BigInt(10),
      nombre: "Ruta Curia - Reconexión",
      descripcion: "Ruta para reconexiones de Curia",
      tipoRuta: "RECONEXION" as const,
      comunidadId: comunidades[4]?.comunidadId || 5,
      sectorId: null,
      estado: "PENDIENTE" as const,
      fechaPlanificada: new Date("2026-05-22"),
    },
  ];

  const todasLasRutas = [...rutasTomaLectura, ...rutasReconexion];
  let rutasCount = 0;

  for (const ruta of todasLasRutas) {
    await prisma.rutas.upsert({
      where: { rutaId: ruta.rutaId },
      update: {
        nombre: ruta.nombre,
        periodoId: 'periodoId' in ruta ? ruta.periodoId : undefined,
      },
      create: {
        ...ruta,
        operarioId,
      },
    });
    rutasCount++;
  }

  console.log(`✅ ${rutasCount} rutas creadas correctamente.`);

  return {
    rutasCreadas: rutasCount,
  };
}
