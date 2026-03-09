import { PrismaClient } from '../../../src/generated/prisma/client';

export async function seedClients(prisma: PrismaClient) {
  // Buscar las comunidades por nombre para obtener sus IDs
  const comunidades = await prisma.comunidades.findMany();
  const comunidadMap: Record<string, bigint> = {};
  comunidades.forEach(c => {
    comunidadMap[c.nombre.toLowerCase()] = c.comunidadId;
  });

  // Datos reales de clientes (asignar comunidad aleatoria si no hay info)
  const comunas = Object.keys(comunidadMap);
  const clientes = [
    { nombre: 'ANDY BRYAN ALEJANDRO VERA', cedula: '2450284290' },
    { nombre: 'SKAY GISELL ALVARADO RODRIGUEZ', cedula: '2400453748' },
    { nombre: 'ISMAEL JAREK ANCHUNDIA CATUTO', cedula: '2400423675' },
    { nombre: 'LUIS ALFREDO ANCHUNDIA CRUZ', cedula: '0944288513' },
    { nombre: 'GINO MAXIMILIANO BERMUDEZ SANTOS', cedula: '2450118084' },
    { nombre: 'JEAN PIERRE CEDEÑO ANDRADE', cedula: '2400245763' },
    { nombre: 'ESTEFANY SUGGEIDY DE LA A POZO', cedula: '2400181729' },
    { nombre: 'DANIEL ALEJANDRO DE LA CRUZ TOMALA', cedula: '0928017326' },
    { nombre: 'JULIO JOSE DEL PEZO RODRIGUEZ', cedula: '2400392417' },
    { nombre: 'OSCAR JORDAN GONZABAY MUÑOZ', cedula: '2450184011' },
    { nombre: 'ESTALIN GABRIEL JAEN GARCIA', cedula: '0942846502' },
    { nombre: 'JEAN CARLOS LINO SANCHEZ', cedula: '2450296237' },
    { nombre: 'DIANA LUCIA MELENA SANTANDER', cedula: '2450128257' },
    { nombre: 'JONATHAN STEVEN MUÑOZ ROSALES', cedula: '2400187270' },
    { nombre: 'PAULO RAFAEL ORRALA ARRIAGA', cedula: '2450914664' },
    { nombre: 'PETER LEONARDO ORRALA VILLON', cedula: '2450060765' },
    { nombre: 'CARLOS FERNANDO PATIÑO GARCIA', cedula: '1315679447' },
    { nombre: 'SAID FAUSTO PINTO TAMAYO', cedula: '1900583731' },
    { nombre: 'JOSE EDUARDO PONCE CARLOS', cedula: '2450066754' },
    { nombre: 'DAYRON ADRIAN QUIÑONEZ VALENCIA', cedula: '0942708264' },
    { nombre: 'ALISSON YAMEL REYES RICARDO', cedula: '2400310278' },
    { nombre: 'YANDRIS MIGUEL RIVERA TORRES', cedula: '0926914227' },
    { nombre: 'MELANIE ADRIANA TOMALÁ MEREJILDO', cedula: '2450174533' },
    { nombre: 'AMY DAMARIS TOMALA SILVESTRE', cedula: '2450618232' },
    { nombre: 'DAMIAN JESUS TORRES CADENA', cedula: '0803570563' },
    { nombre: 'ANGEL ALEJANDRO VILLON PANIMBOZA', cedula: '0928029875' },
  ];

  await prisma.clientes.createMany({
    data: clientes.map((c, i) => ({
      nombre: c.nombre,
      cedula: c.cedula,
      comunidadId: comunas.length ? comunidadMap[comunas[i % comunas.length]] : undefined,
    })),
    skipDuplicates: true,
  });
}
