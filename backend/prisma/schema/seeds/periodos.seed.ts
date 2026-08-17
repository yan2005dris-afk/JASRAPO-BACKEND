export async function seedPeriodos(prisma: any) {
  const periodos = [
    {
      nombre: '2024',
      fechaInicio: '2024-01-01',
      fechaFin: '2024-12-31',
      fechaVencimiento: '2025-01-15',
      estado: 'CERRADO' as any,
    },
    {
      nombre: '2025',
      fechaInicio: '2025-01-01',
      fechaFin: '2025-12-31',
      fechaVencimiento: '2026-01-15',
      estado: 'CERRADO' as any,
    },
    {
      nombre: '2026',
      fechaInicio: '2026-01-01',
      fechaFin: '2026-12-31',
      fechaVencimiento: '2027-01-15',
      estado: 'ABIERTO' as any,
    },
    {
      nombre: '2027',
      fechaInicio: '2027-01-01',
      fechaFin: '2027-12-31',
      fechaVencimiento: '2028-01-15',
      estado: 'CERRADO' as any,
    },
  ];

  const periodosDb: Array<Record<string, any>> = [];
  for (const p of periodos) {
    const record = await prisma.periodos.upsert({
      where: { nombre: p.nombre },
      update: {},
      create: {
        nombre: p.nombre,
        fechaInicio: new Date(p.fechaInicio),
        fechaFin: new Date(p.fechaFin),
        fechaVencimiento: new Date(p.fechaVencimiento),
        estado: p.estado,
      },
    });
    periodosDb.push(record);
  }

  return periodosDb;
}
