import type { PrismaClient } from 'src/generated/prisma/client';

export async function seedContratos(prisma: PrismaClient) {
  const contratos: any[] = [];
  const sectoresOlon = [1, 2, 3, 4]; // IDs de sectores creados en sectores.seed
  const comunidades = [1, 2, 3, 4, 5]; // Olon, Nuñez, La Entrada, San Jose, Curia
  const categorias = [1, 2, 3];

  // Contratos base para asegurar datos conocidos
  const contratosBase = [
    {
      contratoId: 1,
      clienteId: 1,
      comunidadId: 1,
      sectorId: 1,
      categoriaTarifaId: 1,
      numeroGuia: 'GUIA-OLON-001',
    },
    {
      contratoId: 2,
      clienteId: 2,
      comunidadId: 1,
      sectorId: 2,
      categoriaTarifaId: 1,
      numeroGuia: 'GUIA-OLON-002',
    },
    {
      contratoId: 3,
      clienteId: 3,
      comunidadId: 2,
      sectorId: null,
      categoriaTarifaId: 1,
      numeroGuia: 'GUIA-NUNEZ-001',
    },
  ];

  for (const c of contratosBase) {
    const created = await prisma.contratos.upsert({
      where: { contratoId: BigInt(c.contratoId) },
      update: {},
      create: {
        contratoId: BigInt(c.contratoId),
        clienteId: BigInt(c.clienteId),
        comunidadId: c.comunidadId,
        sectorId: c.sectorId,
        categoriaTarifaId: c.categoriaTarifaId,
        numeroGuia: c.numeroGuia,
        direccionSuministro: `Direccion contrato ${c.contratoId}`,
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
      },
    });
    contratos.push(created);
  }

  // Generar adicionales
  let nextContratoId = 4;
  for (let clienteId = 4; clienteId <= 50; clienteId++) {
    // Seleccionar comunidad aleatoria
    const comunidadId =
      comunidades[Math.floor(Math.random() * comunidades.length)];

    // Si es Olon (1), asignar sector
    let sectorId: number | null = null;
    if (comunidadId === 1) {
      sectorId = sectoresOlon[Math.floor(Math.random() * sectoresOlon.length)];
    }

    const categoriaTarifaId =
      categorias[Math.floor(Math.random() * categorias.length)];

    const created = await prisma.contratos.create({
      data: {
        contratoId: BigInt(nextContratoId),
        clienteId: BigInt(clienteId),
        comunidadId: comunidadId,
        sectorId: sectorId,
        categoriaTarifaId: categoriaTarifaId,
        numeroGuia: `GUIA-${comunidadId}-${nextContratoId.toString().padStart(4, '0')}`,
        direccionSuministro: `Direccion contrato ${nextContratoId}`,
        estadoServicio: 'ACTIVO',
        estadoCobranza: 'AL_DIA',
      },
    });
    contratos.push(created);
    nextContratoId++;
  }

  return contratos;
}
