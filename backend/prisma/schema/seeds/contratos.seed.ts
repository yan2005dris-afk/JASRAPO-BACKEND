import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedContratos(prisma: PrismaClient) {
  const contratos: any[] = [];
  const sectoresOlon = [1, 2, 3, 4]; // IDs de sectores creados en sectores.seed
  const comunidades = [1, 2, 3, 4, 5]; // Olon, Nuñez, La Entrada, San Jose, Curia
  const categorias = [1, 2, 3];

  const maxMedidor = await prisma.medidores.findFirst({
    orderBy: { medidorId: 'desc' },
  });
  let nextMedidorId = Number(maxMedidor?.medidorId ?? 5) + 1;

  // Mapa de códigos de comunidad para formato de guía
  const comunidadesCodigos: Record<number, string> = {
    1: '001',
    2: '002',
    3: '003',
    4: '004',
    5: '005',
  };

  const secuencia = await prisma.secuenciaContrato.findFirst({
    orderBy: { secuenciaContratoId: 'asc' },
  });
  const longitudSecuencia = secuencia?.longitud ?? 5;
  let valorSecuencial = Number(secuencia?.ultimoValor ?? 0n);

  // Helper para crear e instalar medidor
  const crearEInstalarMedidor = async (
    contratoId: bigint,
    comunidadId: number,
    fechaInicio: Date,
  ) => {
    let lat = -1.7966 + (Math.random() - 0.5) * 0.008;
    let lng = -80.7568 + (Math.random() - 0.5) * 0.008;
    if (comunidadId === 2) {
      lat = -1.7611 + (Math.random() - 0.5) * 0.005;
      lng = -80.7678 + (Math.random() - 0.5) * 0.005;
    } else if (comunidadId === 3) {
      lat = -1.7456 + (Math.random() - 0.5) * 0.005;
      lng = -80.7712 + (Math.random() - 0.5) * 0.005;
    } else if (comunidadId === 4) {
      lat = -1.8212 + (Math.random() - 0.5) * 0.005;
      lng = -80.7412 + (Math.random() - 0.5) * 0.005;
    } else if (comunidadId === 5) {
      lat = -1.8089 + (Math.random() - 0.5) * 0.005;
      lng = -80.749 + (Math.random() - 0.5) * 0.005;
    }

    const marca = nextMedidorId % 2 === 0 ? 'Itron' : 'Sensus';
    const modelo = nextMedidorId % 2 === 0 ? 'CEntra 500' : 'iPerl';
    const serie = `MED-${String(nextMedidorId).padStart(5, '0')}`;

    const medidor = await prisma.medidores.create({
      data: {
        medidorId: BigInt(nextMedidorId),
        marca,
        modelo,
        serie,
        estado: 'INSTALADO',
        fechaInstalacion: fechaInicio,
      },
    });

    await prisma.contratos.update({
      where: { contratoId },
      data: {
        latitud: lat,
        longitud: lng,
      },
    });

    await prisma.historialMedidores.create({
      data: {
        contratoId,
        medidorId: medidor.medidorId,
        fechaDesde: fechaInicio,
        fechaHasta: null,
        lecturaInicial: Math.floor(Math.random() * 25),
      },
    });

    nextMedidorId++;
    return medidor;
  };

  // Contratos base para asegurar datos conocidos
  const contratosBase = [
    {
      contratoId: 1,
      clienteId: 1,
      comunidadId: 1,
      sectorId: 1,
      categoriaTarifaId: 1,
    },
    {
      contratoId: 2,
      clienteId: 2,
      comunidadId: 1,
      sectorId: 2,
      categoriaTarifaId: 1,
    },
    {
      contratoId: 3,
      clienteId: 3,
      comunidadId: 2,
      sectorId: null,
      categoriaTarifaId: 1,
    },
  ];

  for (const c of contratosBase) {
    const fechaInicio = new Date('2026-01-05T00:00:00.000Z');
    valorSecuencial++;
    const codComunidad = comunidadesCodigos[c.comunidadId] || '001';
    const serieMedidor = `MED-${String(nextMedidorId).padStart(5, '0')}`;
    const seqStr = valorSecuencial.toString().padStart(longitudSecuencia, '0');
    const numeroGuia = `${serieMedidor}-${codComunidad}-${seqStr}`;

    const created = await prisma.contratos.upsert({
      where: { contratoId: BigInt(c.contratoId) },
      update: { numeroGuia },
      create: {
        contratoId: BigInt(c.contratoId),
        clienteId: BigInt(c.clienteId),
        comunidadId: c.comunidadId,
        sectorId: c.sectorId,
        categoriaTarifaId: c.categoriaTarifaId,
        numeroGuia,
        direccionSuministro: `Direccion contrato ${c.contratoId}`,
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
        fechaInicio,
      },
    });
    contratos.push(created);

    await crearEInstalarMedidor(created.contratoId, c.comunidadId, fechaInicio);
  }

  // Generar adicionales
  let nextContratoId = 4;
  for (let clienteId = 4; clienteId <= 50; clienteId++) {
    const comunidadId =
      comunidades[Math.floor(Math.random() * comunidades.length)];

    let sectorId: number | null = null;
    if (comunidadId === 1) {
      sectorId = sectoresOlon[Math.floor(Math.random() * sectoresOlon.length)];
    }

    const categoriaTarifaId =
      categorias[Math.floor(Math.random() * categorias.length)];
    const fechaInicio = new Date('2026-01-15T00:00:00.000Z');

    valorSecuencial++;
    const codComunidad = comunidadesCodigos[comunidadId] || '001';
    const serieMedidor = `MED-${String(nextMedidorId).padStart(5, '0')}`;
    const seqStr = valorSecuencial.toString().padStart(longitudSecuencia, '0');
    const numeroGuia = `${serieMedidor}-${codComunidad}-${seqStr}`;

    const created = await prisma.contratos.create({
      data: {
        contratoId: BigInt(nextContratoId),
        clienteId: BigInt(clienteId),
        comunidadId: comunidadId,
        sectorId: sectorId,
        categoriaTarifaId: categoriaTarifaId,
        numeroGuia,
        direccionSuministro: `Direccion contrato ${nextContratoId}`,
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
        fechaInicio,
      },
    });
    contratos.push(created);

    await crearEInstalarMedidor(created.contratoId, comunidadId, fechaInicio);

    nextContratoId++;
  }

  if (secuencia) {
    await prisma.secuenciaContrato.update({
      where: { secuenciaContratoId: secuencia.secuenciaContratoId },
      data: { ultimoValor: BigInt(valorSecuencial) },
    });
  }

  console.log(
    `✅ ${contratos.length} contratos creados con guías secuenciales (${valorSecuencial}) y medidores activos asignados.`,
  );
  return contratos;
}
